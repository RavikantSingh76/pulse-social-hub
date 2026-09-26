package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.AudioTrack;
import com.socialmedia.entity.User;
import com.socialmedia.repository.AudioTrackRepository;
import com.socialmedia.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.socialmedia.util.FileUploadSecurityUtil;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AudioTrackService {

    @Autowired
    private AudioTrackRepository audioTrackRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AudioTrackResponse> getTrendingAudio(int page, int limit) {
        return audioTrackRepository.findTrendingTracks(PageRequest.of(Math.max(0, page - 1), limit))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AudioTrackResponse> searchAudio(String query, int page, int limit) {
        if (query == null || query.trim().isEmpty()) {
            return getTrendingAudio(page, limit);
        }
        return audioTrackRepository.searchTracks(query.trim(), PageRequest.of(Math.max(0, page - 1), limit))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AudioTrackResponse> getRecentAudio(int page, int limit) {
        return audioTrackRepository.findRecentTracks(PageRequest.of(Math.max(0, page - 1), limit))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AudioTrackResponse getAudioById(Long id) {
        AudioTrack track = audioTrackRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Audio track not found with id: " + id));
        return mapToResponse(track);
    }

    @Transactional
    public AudioTrackResponse uploadAudioTrack(
            Long userId,
            String title,
            String artist,
            Double duration,
            String genre,
            String sourceType,
            String licenseType,
            String copyrightOwner,
            MultipartFile audioFile,
            MultipartFile coverFile) {

        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Audio title is required");
        }
        if (artist == null || artist.trim().isEmpty()) {
            throw new IllegalArgumentException("Artist name is required");
        }
        if (audioFile == null || audioFile.isEmpty()) {
            throw new IllegalArgumentException("Audio file is required");
        }

        User creator = userId != null ? userRepository.findById(userId).orElse(null) : null;

        // Save audio file securely to uploads/audio
        String audioFileName;
        String coverUrl = null;
        try {
            audioFileName = FileUploadSecurityUtil.storeAudio(audioFile, "./uploads/audio");
            if (coverFile != null && !coverFile.isEmpty()) {
                String coverFileName = FileUploadSecurityUtil.storeImageFilename(coverFile, "./uploads/audio/covers");
                coverUrl = "/uploads/audio/covers/" + coverFileName;
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to store audio files: " + e.getMessage(), e);
        }
        String audioUrl = "/uploads/audio/" + audioFileName;

        AudioTrack.SourceType st = AudioTrack.SourceType.USER_UPLOADED;
        if (sourceType != null) {
            try {
                st = AudioTrack.SourceType.valueOf(sourceType.toUpperCase());
            } catch (Exception ignored) {}
        }

        AudioTrack.LicenseType lt = AudioTrack.LicenseType.ROYALTY_FREE;
        if (licenseType != null) {
            try {
                lt = AudioTrack.LicenseType.valueOf(licenseType.toUpperCase());
            } catch (Exception ignored) {}
        }

        AudioTrack track = AudioTrack.builder()
                .title(title.trim())
                .artist(artist.trim())
                .audioUrl(audioUrl)
                .coverUrl(coverUrl != null ? coverUrl : "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=300")
                .duration(duration != null && duration > 0 ? duration : 180.0)
                .createdBy(creator)
                .sourceType(st)
                .licenseType(lt)
                .copyrightOwner(copyrightOwner != null ? copyrightOwner : (creator != null ? creator.getDisplayName() : "Public"))
                .genre(genre != null ? genre : "All")
                .isPublic(true)
                .isActive(true)
                .usageCount(0L)
                .build();

        AudioTrack saved = audioTrackRepository.save(track);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteAudioTrack(Long trackId, Long currentUserId) {
        AudioTrack track = audioTrackRepository.findById(trackId)
                .orElseThrow(() -> new IllegalArgumentException("Audio track not found with id: " + trackId));

        if (track.getCreatedBy() != null && !track.getCreatedBy().getId().equals(currentUserId)) {
            User user = userRepository.findById(currentUserId).orElse(null);
            if (user == null || user.getRole() != User.Role.ADMIN) {
                throw new IllegalStateException("Unauthorized: You cannot delete an audio track created by another user.");
            }
        }

        track.setIsActive(false);
        audioTrackRepository.save(track);
    }

    @Transactional
    public void incrementUsage(Long trackId) {
        if (trackId != null) {
            audioTrackRepository.incrementUsageCount(trackId);
        }
    }

    public AudioTrackResponse mapToResponse(AudioTrack track) {
        if (track == null) return null;
        return AudioTrackResponse.builder()
                .id(track.getId())
                .title(track.getTitle())
                .artist(track.getArtist())
                .audioUrl(track.getAudioUrl())
                .coverUrl(track.getCoverUrl())
                .duration(track.getDuration())
                .sourceType(track.getSourceType() != null ? track.getSourceType().name() : null)
                .licenseType(track.getLicenseType() != null ? track.getLicenseType().name() : null)
                .copyrightOwner(track.getCopyrightOwner())
                .usageCount(track.getUsageCount() != null ? track.getUsageCount() : 0L)
                .genre(track.getGenre())
                .createdById(track.getCreatedBy() != null ? track.getCreatedBy().getId() : null)
                .createdByName(track.getCreatedBy() != null ? track.getCreatedBy().getDisplayName() : "Platform Audio")
                .createdAt(track.getCreatedAt() != null ? track.getCreatedAt().toString() : null)
                .build();
    }
}
