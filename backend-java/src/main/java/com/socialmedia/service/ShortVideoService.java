package com.socialmedia.service;

import com.socialmedia.dto.Dtos.ShortVideoResponse;
import com.socialmedia.entity.ShortVideo;
import com.socialmedia.entity.ShortVideo.VideoStatus;
import com.socialmedia.entity.User;
import com.socialmedia.repository.ShortVideoRepository;
import com.socialmedia.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class ShortVideoService {

    @Autowired
    private ShortVideoRepository shortVideoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VideoStorageService videoStorageService;

    @Autowired
    private VideoMetadataExtractor videoMetadataExtractor;

    @Value("${app.video.max-duration-seconds:20.0}")
    private double maxDurationSeconds;

    @Value("${app.video.max-file-size-mb:50}")
    private long maxFileSizeMb;

    @Value("${app.video.allowed-mime-types:video/mp4,video/webm}")
    private String allowedMimeTypes;

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    /**
     * Uploads and validates a short video.
     * Enforces server-side duration <= maxDurationSeconds (20.0s), format, and security constraints.
     */
    @Transactional
    public ShortVideoResponse uploadShortVideo(Long userId, MultipartFile file) {
        if (userId == null) {
            throw new SecurityException("Unauthorized: user ID is required to upload video");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Video file cannot be empty");
        }

        long maxBytes = maxFileSizeMb * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException("File size (" + (file.getSize() / (1024 * 1024)) + "MB) exceeds maximum limit of " + maxFileSizeMb + "MB");
        }

        // 1. Stream file directly to secure storage
        VideoStorageService.StoredVideoFile storedFile;
        try {
            storedFile = videoStorageService.storeVideo(file);
        } catch (IOException e) {
            log.error("Failed to store uploaded video on disk: {}", e.getMessage());
            throw new RuntimeException("Storage failure: unable to write video file to disk", e);
        }

        // 2. Validate metadata and server-side duration directly from disk
        VideoMetadataExtractor.VideoMetadata metadata;
        try {
            metadata = videoMetadataExtractor.extractMetadata(storedFile.getFile());
        } catch (Exception e) {
            // Clean up stored file on failure
            videoStorageService.deleteFile(storedFile.getStoragePath());
            log.warn("Corrupt or invalid video upload rejected: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid or corrupt video file: " + e.getMessage(), e);
        }

        // 3. Verify MIME type against allowed list
        List<String> allowedTypes = Arrays.asList(allowedMimeTypes.split(","));
        boolean mimeAllowed = allowedTypes.stream().anyMatch(t -> t.trim().equalsIgnoreCase(metadata.getMimeType()));
        if (!mimeAllowed) {
            videoStorageService.deleteFile(storedFile.getStoragePath());
            throw new IllegalArgumentException("Unsupported video MIME type: " + metadata.getMimeType() + ". Allowed: " + allowedMimeTypes);
        }

        // 4. Strict duration verification (Maximum allowed: 20.0 seconds)
        if (metadata.getDurationSeconds() > maxDurationSeconds) {
            videoStorageService.deleteFile(storedFile.getStoragePath());
            log.warn("Video rejected: duration {}s exceeds max allowed {}s", metadata.getDurationSeconds(), maxDurationSeconds);
            throw new IllegalArgumentException(String.format("Video duration (%.2fs) exceeds maximum allowed limit of %.1f seconds",
                    metadata.getDurationSeconds(), maxDurationSeconds));
        }

        // 5. Duplicate / Idempotency Check
        Optional<ShortVideo> existing = shortVideoRepository.findByChecksumSha256AndUser(storedFile.getChecksumSha256(), user);
        if (existing.isPresent()) {
            ShortVideo duplicate = existing.get();
            if (duplicate.getStatus() == VideoStatus.READY || duplicate.getStatus() == VideoStatus.UPLOADED) {
                // Delete newly uploaded identical physical copy and return existing reference
                videoStorageService.deleteFile(storedFile.getStoragePath());
                log.info("Idempotent upload: returning existing ShortVideo {}", duplicate.getVideoId());
                return mapToResponse(duplicate);
            }
        }

        // 6. Save metadata record to database in UPLOADED status
        ShortVideo shortVideo = ShortVideo.builder()
                .videoId(storedFile.getVideoId())
                .user(user)
                .fileUrl(storedFile.getFileUrl())
                .storagePath(storedFile.getStoragePath())
                .duration(metadata.getDurationSeconds())
                .fileSize(storedFile.getFileSize())
                .mimeType(metadata.getMimeType())
                .status(VideoStatus.UPLOADED)
                .checksumSha256(storedFile.getChecksumSha256())
                .build();

        ShortVideo saved = shortVideoRepository.save(shortVideo);
        log.info("ShortVideo created: videoId={}, duration={}s, status={}", saved.getVideoId(), saved.getDuration(), saved.getStatus());

        // 7. Dispatch async processing pipeline
        processShortVideoAsync(saved.getId());

        return mapToResponse(saved);
    }

    /**
     * Controlled background async processing worker.
     */
    @Async("videoProcessingExecutor")
    public void processShortVideoAsync(Long shortVideoId) {
        try {
            Optional<ShortVideo> opt = shortVideoRepository.findById(shortVideoId);
            if (opt.isEmpty()) return;

            ShortVideo video = opt.get();
            video.setStatus(VideoStatus.PROCESSING);
            shortVideoRepository.save(video);

            // Verify file integrity on disk
            File file = new File(video.getStoragePath());
            if (!file.exists() || file.length() == 0) {
                video.setStatus(VideoStatus.FAILED);
                video.setFailureReason("Physical video file missing on disk");
                shortVideoRepository.save(video);
                return;
            }

            // Successfully processed
            video.setStatus(VideoStatus.READY);
            shortVideoRepository.save(video);
            log.info("Async video processing completed for videoId: {}", video.getVideoId());

        } catch (Exception e) {
            log.error("Async video processing error for id {}: {}", shortVideoId, e.getMessage());
            shortVideoRepository.findById(shortVideoId).ifPresent(v -> {
                v.setStatus(VideoStatus.FAILED);
                v.setFailureReason("Processing failure: " + e.getMessage());
                shortVideoRepository.save(v);
            });
        }
    }

    @Transactional(readOnly = true)
    public ShortVideoResponse getVideoByVideoId(String videoId) {
        ShortVideo video = shortVideoRepository.findByVideoId(videoId)
                .orElseThrow(() -> new IllegalArgumentException("Video not found with videoId: " + videoId));
        return mapToResponse(video);
    }

    @Transactional
    public void deleteShortVideo(Long currentUserId, String videoId) {
        ShortVideo video = shortVideoRepository.findByVideoId(videoId)
                .orElseThrow(() -> new IllegalArgumentException("Video not found with videoId: " + videoId));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean isOwner = video.getUser().getId().equals(currentUserId);
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new SecurityException("Forbidden: you are not authorized to delete this video");
        }

        // Delete physical file
        videoStorageService.deleteFile(video.getStoragePath());

        // Delete DB record
        shortVideoRepository.delete(video);
        log.info("ShortVideo deleted: videoId={} by userId={}", videoId, currentUserId);
    }

    @Transactional(readOnly = true)
    public Page<ShortVideoResponse> getUserVideos(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        return shortVideoRepository.findByUser(user, pageable).map(this::mapToResponse);
    }

    private ShortVideoResponse mapToResponse(ShortVideo video) {
        return ShortVideoResponse.builder()
                .videoId(video.getVideoId())
                .status(video.getStatus().name())
                .duration(video.getDuration())
                .fileSize(video.getFileSize())
                .fileUrl(video.getFileUrl())
                .mimeType(video.getMimeType())
                .userId(video.getUser().getId())
                .username(video.getUser().getUsername())
                .failureReason(video.getFailureReason())
                .createdAt(video.getCreatedAt() != null ? video.getCreatedAt().format(ISO_FORMATTER) : null)
                .updatedAt(video.getUpdatedAt() != null ? video.getUpdatedAt().format(ISO_FORMATTER) : null)
                .build();
    }
}
