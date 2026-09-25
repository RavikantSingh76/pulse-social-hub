package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.AudioTrack;
import com.socialmedia.entity.Reel;
import com.socialmedia.entity.User;
import com.socialmedia.repository.AudioTrackRepository;
import com.socialmedia.repository.ReelRepository;
import com.socialmedia.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;

@Service
public class ReelService {

    private static final Logger log = LoggerFactory.getLogger(ReelService.class);

    public static final double MAX_REEL_DURATION_SECONDS = 20.0;
    public static final long MAX_REEL_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

    @Autowired
    private ReelRepository reelRepository;

    @Autowired
    private AudioTrackRepository audioTrackRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VideoStorageService videoStorageService;

    @Autowired
    private VideoMetadataExtractor metadataExtractor;

    @Autowired
    private AudioTrackService audioTrackService;

    @Autowired
    private FFmpegAudioMixerService ffmpegAudioMixerService;

    @Autowired
    private AuthService authService;

    @Autowired(required = false)
    @Qualifier("videoProcessingExecutor")
    private Executor videoProcessingExecutor;

    @Transactional
    public ReelResponse createReel(
            Long userId,
            MultipartFile videoFile,
            String caption,
            Long musicId,
            Double audioStartTime,
            Double audioEndTime,
            Integer originalAudioVolume,
            Integer musicVolume,
            MultipartFile thumbnailFile,
            String thumbnailUrlInput) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        if (videoFile == null || videoFile.isEmpty()) {
            throw new IllegalArgumentException("Video file is required.");
        }

        if (videoFile.getSize() > MAX_REEL_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException(String.format("File size %dMB exceeds max allowed %dMB",
                    videoFile.getSize() / (1024 * 1024), MAX_REEL_FILE_SIZE_BYTES / (1024 * 1024)));
        }

        String mimeType = videoFile.getContentType();
        if (mimeType == null || (!mimeType.equalsIgnoreCase("video/mp4") &&
                                 !mimeType.equalsIgnoreCase("video/webm") &&
                                 !mimeType.equalsIgnoreCase("video/quicktime") &&
                                 !mimeType.equalsIgnoreCase("application/octet-stream"))) {
            throw new IllegalArgumentException("Unsupported video format. Allowed: MP4, WebM");
        }

        // 1. Stream video to disk
        VideoStorageService.StoredVideoFile storedVideo;
        try {
            storedVideo = videoStorageService.storeVideo(videoFile);
        } catch (IOException e) {
            throw new RuntimeException("Failed to stream video to storage: " + e.getMessage(), e);
        }

        // 2. Server-side validation of duration and magic bytes
        VideoMetadataExtractor.VideoMetadata metadata;
        try {
            metadata = metadataExtractor.extractMetadata(storedVideo.getFile());
        } catch (Exception e) {
            videoStorageService.deleteFile(storedVideo.getStoragePath());
            throw new IllegalArgumentException("Corrupt or invalid video file: " + e.getMessage());
        }

        if (metadata.getDurationSeconds() > MAX_REEL_DURATION_SECONDS) {
            videoStorageService.deleteFile(storedVideo.getStoragePath());
            throw new IllegalArgumentException(String.format("Video duration %.1fs exceeds maximum allowed duration of %.1fs",
                    metadata.getDurationSeconds(), MAX_REEL_DURATION_SECONDS));
        }

        // 3. Optional soundtrack resolution
        AudioTrack audioTrack = null;
        if (musicId != null) {
            audioTrack = audioTrackRepository.findById(musicId).orElse(null);
            if (audioTrack != null) {
                audioTrackService.incrementUsage(musicId);
            }
        }

        // 4. Thumbnail resolution
        String finalThumbUrl = thumbnailUrlInput;
        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            try {
                VideoStorageService.StoredVideoFile thumbResult = videoStorageService.storeVideo(thumbnailFile);
                finalThumbUrl = thumbResult.getFileUrl();
            } catch (Exception ignored) {}
        }
        if (finalThumbUrl == null || finalThumbUrl.isEmpty()) {
            finalThumbUrl = "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400";
        }

        // 5. Initial Reel entity creation
        Reel reel = Reel.builder()
                .user(user)
                .videoUrl(storedVideo.getFileUrl())
                .storagePath(storedVideo.getStoragePath())
                .thumbnailUrl(finalThumbUrl)
                .caption(caption)
                .duration(metadata.getDurationSeconds())
                .audioTrack(audioTrack)
                .audioStartTime(audioStartTime != null ? Math.max(0.0, audioStartTime) : 0.0)
                .audioEndTime(audioEndTime != null ? Math.min(20.0, audioEndTime) : Math.min(20.0, metadata.getDurationSeconds()))
                .originalAudioVolume(originalAudioVolume != null ? Math.max(0, Math.min(100, originalAudioVolume)) : 100)
                .musicVolume(musicVolume != null ? Math.max(0, Math.min(100, musicVolume)) : 80)
                .checksumSha256(storedVideo.getChecksumSha256())
                .status(Reel.ReelStatus.PROCESSING)
                .likesCount(0L)
                .commentsCount(0L)
                .sharesCount(0L)
                .viewCount(0L)
                .build();

        Reel savedReel = reelRepository.save(reel);

        // 6. Trigger async background processing
        if (videoProcessingExecutor != null) {
            final Long reelId = savedReel.getId();
            final String videoDiskPath = storedVideo.getStoragePath();
            final AudioTrack finalAudio = audioTrack;
            final Double start = reel.getAudioStartTime();
            final Double dur = reel.getDuration();
            final int origVol = reel.getOriginalAudioVolume();
            final int musVol = reel.getMusicVolume();

            videoProcessingExecutor.execute(() -> {
                try {
                    // If music is attached, attempt audio mixing
                    if (finalAudio != null && finalAudio.getAudioUrl() != null) {
                        String localAudioPath = resolveLocalAudioPath(finalAudio.getAudioUrl());
                        if (localAudioPath != null) {
                            String mixedVideoPath = ffmpegAudioMixerService.mixVideoWithAudio(
                                    videoDiskPath, localAudioPath, start, dur, origVol, musVol);
                            if (mixedVideoPath != null) {
                                Path mixedPath = Paths.get(mixedVideoPath);
                                String mixedUrl = "/uploads/videos/" + mixedPath.getFileName().toString();
                                updateReelStatusAndUrl(reelId, Reel.ReelStatus.READY, mixedUrl, null);
                                return;
                            }
                        }
                    }
                    // Mark READY
                    updateReelStatusAndUrl(reelId, Reel.ReelStatus.READY, null, null);
                } catch (Exception e) {
                    log.error("Error in async reel processing for ID {}: {}", reelId, e.getMessage());
                    updateReelStatusAndUrl(reelId, Reel.ReelStatus.FAILED, null, e.getMessage());
                }
            });
        } else {
            savedReel.setStatus(Reel.ReelStatus.READY);
            savedReel = reelRepository.save(savedReel);
        }

        return mapToResponse(savedReel, userId);
    }

    @Transactional
    public void updateReelStatusAndUrl(Long reelId, Reel.ReelStatus status, String newUrl, String failureReason) {
        reelRepository.findById(reelId).ifPresent(r -> {
            r.setStatus(status);
            if (newUrl != null) {
                r.setVideoUrl(newUrl);
            }
            if (failureReason != null) {
                r.setFailureReason(failureReason);
            }
            reelRepository.save(r);
        });
    }

    @Transactional(readOnly = true)
    public ReelFeedResponse getFeedReels(int page, int limit, Long currentUserId) {
        Page<Reel> reelsPage = reelRepository.findFeedReels(PageRequest.of(Math.max(0, page - 1), limit));
        List<ReelResponse> responses = reelsPage.getContent().stream()
                .map(r -> mapToResponse(r, currentUserId))
                .collect(Collectors.toList());

        return ReelFeedResponse.builder()
                .reels(responses)
                .page(page)
                .limit(limit)
                .total(reelsPage.getTotalElements())
                .hasMore(reelsPage.hasNext())
                .build();
    }

    @Transactional(readOnly = true)
    public ReelResponse getReelById(Long id, Long currentUserId) {
        Reel reel = reelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reel not found with id: " + id));
        return mapToResponse(reel, currentUserId);
    }

    @Transactional
    public ReelResponse updateReel(Long id, Long currentUserId, UpdateReelRequest req) {
        Reel reel = reelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reel not found with id: " + id));

        if (!reel.getUser().getId().equals(currentUserId)) {
            User user = userRepository.findById(currentUserId).orElse(null);
            if (user == null || user.getRole() != User.Role.ADMIN) {
                throw new IllegalStateException("Unauthorized: You do not own this reel.");
            }
        }

        if (req.getCaption() != null) {
            reel.setCaption(req.getCaption());
        }
        if (req.getThumbnailUrl() != null) {
            reel.setThumbnailUrl(req.getThumbnailUrl());
        }

        Reel updated = reelRepository.save(reel);
        return mapToResponse(updated, currentUserId);
    }

    @Transactional
    public void deleteReel(Long id, Long currentUserId) {
        Reel reel = reelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reel not found with id: " + id));

        if (!reel.getUser().getId().equals(currentUserId)) {
            User user = userRepository.findById(currentUserId).orElse(null);
            if (user == null || user.getRole() != User.Role.ADMIN) {
                throw new IllegalStateException("Unauthorized: You do not have permission to delete this reel.");
            }
        }

        if (reel.getStoragePath() != null) {
            videoStorageService.deleteFile(reel.getStoragePath());
        }

        reelRepository.delete(reel);
    }

    @Transactional
    public void recordView(Long id) {
        reelRepository.incrementViewCount(id);
    }

    @Transactional
    public boolean toggleLike(Long reelId, Long currentUserId) {
        reelRepository.incrementLikesCount(reelId);
        return true;
    }

    public ReelResponse mapToResponse(Reel reel, Long currentUserId) {
        if (reel == null) return null;

        AudioTrackResponse audioDto = null;
        if (reel.getAudioTrack() != null) {
            audioDto = audioTrackService.mapToResponse(reel.getAudioTrack());
        }

        UserResponse userDto = authService.mapToUserResponse(reel.getUser(), currentUserId);

        return ReelResponse.builder()
                .id(reel.getId())
                .videoUrl(reel.getVideoUrl())
                .thumbnailUrl(reel.getThumbnailUrl())
                .caption(reel.getCaption())
                .duration(reel.getDuration())
                .music(audioDto)
                .audioStartTime(reel.getAudioStartTime())
                .audioEndTime(reel.getAudioEndTime())
                .originalAudioVolume(reel.getOriginalAudioVolume())
                .musicVolume(reel.getMusicVolume())
                .views(reel.getViewCount())
                .likesCount(reel.getLikesCount())
                .commentsCount(reel.getCommentsCount())
                .sharesCount(reel.getSharesCount())
                .isLiked(false)
                .isSaved(false)
                .status(reel.getStatus() != null ? reel.getStatus().name() : "READY")
                .failureReason(reel.getFailureReason())
                .user(userDto)
                .createdAt(reel.getCreatedAt() != null ? reel.getCreatedAt().toString() : null)
                .updatedAt(reel.getUpdatedAt() != null ? reel.getUpdatedAt().toString() : null)
                .build();
    }

    private String resolveLocalAudioPath(String audioUrl) {
        if (audioUrl == null) return null;
        if (audioUrl.startsWith("/uploads/")) {
            Path p = Paths.get("." + audioUrl).toAbsolutePath().normalize();
            if (Files.exists(p)) return p.toString();
        }
        return null;
    }
}
