package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.Playlist;
import com.socialmedia.entity.PlaylistVideo;
import com.socialmedia.entity.Reel;
import com.socialmedia.entity.ShortVideo;
import com.socialmedia.entity.User;
import com.socialmedia.repository.PlaylistRepository;
import com.socialmedia.repository.PlaylistVideoRepository;
import com.socialmedia.repository.ReelRepository;
import com.socialmedia.repository.ShortVideoRepository;
import com.socialmedia.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PlaylistService {

    @Value("${playlist.max-videos:100}")
    private int maxVideosPerPlaylist = 100;

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private PlaylistVideoRepository playlistVideoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReelRepository reelRepository;

    @Autowired
    private ShortVideoRepository shortVideoRepository;

    @Autowired
    private AuthService authService;

    @Transactional
    public PlaylistResponse createPlaylist(Long userId, CreatePlaylistRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        if (req.getName() == null || req.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Playlist name is required.");
        }

        Playlist.Visibility visibility = Playlist.Visibility.PUBLIC;
        if (req.getVisibility() != null && req.getVisibility().equalsIgnoreCase("PRIVATE")) {
            visibility = Playlist.Visibility.PRIVATE;
        }

        Playlist playlist = Playlist.builder()
                .user(user)
                .name(req.getName().trim())
                .description(req.getDescription())
                .coverUrl(req.getCoverUrl())
                .visibility(visibility)
                .build();

        Playlist savedPlaylist = playlistRepository.save(playlist);

        if (req.getVideoIds() != null && !req.getVideoIds().isEmpty()) {
            addVideosToPlaylist(savedPlaylist.getId(), userId, req.getVideoIds());
        }

        return getPlaylistById(savedPlaylist.getId(), userId);
    }

    @Transactional(readOnly = true)
    public List<PlaylistResponse> getUserPlaylists(Long userId) {
        List<Playlist> playlists = playlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return playlists.stream()
                .map(p -> mapToResponse(p, userId, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PlaylistResponse> getAccessiblePlaylists(Long currentUserId, int page, int limit) {
        Page<Playlist> playlistPage = playlistRepository.findAccessiblePlaylists(
                currentUserId != null ? currentUserId : -1L,
                PageRequest.of(Math.max(0, page - 1), limit)
        );
        return playlistPage.getContent().stream()
                .map(p -> mapToResponse(p, currentUserId, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PlaylistResponse getPlaylistById(Long id, Long currentUserId) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found with id: " + id));

        if (playlist.getVisibility() == Playlist.Visibility.PRIVATE) {
            if (currentUserId == null || !playlist.getUser().getId().equals(currentUserId)) {
                User user = currentUserId != null ? userRepository.findById(currentUserId).orElse(null) : null;
                if (user == null || user.getRole() != User.Role.ADMIN) {
                    throw new IllegalStateException("Unauthorized: This playlist is private.");
                }
            }
        }

        return mapToResponse(playlist, currentUserId, true);
    }

    @Transactional
    public PlaylistResponse updatePlaylist(Long id, Long currentUserId, UpdatePlaylistRequest req) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found with id: " + id));

        verifyOwnership(playlist, currentUserId);

        if (req.getName() != null && !req.getName().trim().isEmpty()) {
            playlist.setName(req.getName().trim());
        }
        if (req.getDescription() != null) {
            playlist.setDescription(req.getDescription());
        }
        if (req.getCoverUrl() != null) {
            playlist.setCoverUrl(req.getCoverUrl());
        }
        if (req.getVisibility() != null) {
            if (req.getVisibility().equalsIgnoreCase("PRIVATE")) {
                playlist.setVisibility(Playlist.Visibility.PRIVATE);
            } else if (req.getVisibility().equalsIgnoreCase("PUBLIC")) {
                playlist.setVisibility(Playlist.Visibility.PUBLIC);
            }
        }

        Playlist updated = playlistRepository.save(playlist);
        return mapToResponse(updated, currentUserId, true);
    }

    @Transactional
    public void deletePlaylist(Long id, Long currentUserId) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found with id: " + id));

        verifyOwnership(playlist, currentUserId);
        playlistRepository.delete(playlist);
    }

    @Transactional
    public PlaylistResponse addVideosToPlaylist(Long playlistId, Long currentUserId, List<String> videoIds) {
        if (videoIds == null || videoIds.isEmpty()) {
            throw new IllegalArgumentException("Video IDs list cannot be empty.");
        }

        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found with id: " + playlistId));

        verifyOwnership(playlist, currentUserId);

        long currentCount = playlistVideoRepository.countByPlaylistId(playlistId);

        // Filter out empty video IDs
        List<String> cleanIds = videoIds.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        if (currentCount + cleanIds.size() > maxVideosPerPlaylist) {
            throw new IllegalArgumentException(String.format(
                    "Playlist limit of %d videos exceeded. Current count: %d, Attempted to add: %d (Total: %d)",
                    maxVideosPerPlaylist, currentCount, cleanIds.size(), currentCount + cleanIds.size()
            ));
        }

        int maxPos = playlistVideoRepository.findMaxPositionByPlaylistId(playlistId);

        for (String vid : cleanIds) {
            if (playlistVideoRepository.existsByPlaylistIdAndVideoId(playlistId, vid)) {
                throw new IllegalArgumentException("Video '" + vid + "' is already present in this playlist. Duplicate videos are not allowed.");
            }

            maxPos++;
            PlaylistVideo pv = PlaylistVideo.builder()
                    .playlist(playlist)
                    .videoId(vid)
                    .position(maxPos)
                    .addedAt(LocalDateTime.now())
                    .build();

            playlistVideoRepository.save(pv);
        }

        // Auto-set coverUrl if empty
        if ((playlist.getCoverUrl() == null || playlist.getCoverUrl().isEmpty()) && !cleanIds.isEmpty()) {
            String firstThumb = resolveThumbnail(cleanIds.get(0));
            if (firstThumb != null) {
                playlist.setCoverUrl(firstThumb);
                playlistRepository.save(playlist);
            }
        }

        return getPlaylistById(playlistId, currentUserId);
    }

    @Transactional
    public PlaylistResponse removeVideoFromPlaylist(Long playlistId, Long currentUserId, String videoId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found with id: " + playlistId));

        verifyOwnership(playlist, currentUserId);

        PlaylistVideo pv = playlistVideoRepository.findByPlaylistIdAndVideoId(playlistId, videoId)
                .orElseThrow(() -> new IllegalArgumentException("Video '" + videoId + "' is not in this playlist."));

        playlistVideoRepository.delete(pv);

        // Re-index remaining positions cleanly (1, 2, 3...)
        List<PlaylistVideo> remaining = playlistVideoRepository.findByPlaylistIdOrderByPositionAsc(playlistId);
        int pos = 1;
        for (PlaylistVideo item : remaining) {
            if (item.getPosition() != pos) {
                item.setPosition(pos);
                playlistVideoRepository.save(item);
            }
            pos++;
        }

        return getPlaylistById(playlistId, currentUserId);
    }

    @Transactional
    public PlaylistResponse reorderVideos(Long playlistId, Long currentUserId, List<String> orderedVideoIds) {
        if (orderedVideoIds == null || orderedVideoIds.isEmpty()) {
            throw new IllegalArgumentException("Ordered video IDs list cannot be empty.");
        }

        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found with id: " + playlistId));

        verifyOwnership(playlist, currentUserId);

        List<PlaylistVideo> existing = playlistVideoRepository.findByPlaylistIdOrderByPositionAsc(playlistId);
        Map<String, PlaylistVideo> videoMap = existing.stream()
                .collect(Collectors.toMap(PlaylistVideo::getVideoId, v -> v, (a, b) -> a));

        int pos = 1;
        for (String vid : orderedVideoIds) {
            PlaylistVideo pv = videoMap.get(vid);
            if (pv != null) {
                pv.setPosition(pos++);
                playlistVideoRepository.save(pv);
            }
        }

        return getPlaylistById(playlistId, currentUserId);
    }

    private void verifyOwnership(Playlist playlist, Long currentUserId) {
        if (currentUserId == null || !playlist.getUser().getId().equals(currentUserId)) {
            User user = currentUserId != null ? userRepository.findById(currentUserId).orElse(null) : null;
            if (user == null || user.getRole() != User.Role.ADMIN) {
                throw new IllegalStateException("Unauthorized: You do not have permission to modify this playlist.");
            }
        }
    }

    public PlaylistResponse mapToResponse(Playlist playlist, Long currentUserId, boolean includeVideos) {
        if (playlist == null) return null;

        UserResponse userDto = authService.mapToUserResponse(playlist.getUser(), currentUserId);
        List<PlaylistVideo> pvList = playlistVideoRepository.findByPlaylistIdOrderByPositionAsc(playlist.getId());

        List<PlaylistVideoResponse> videoDtos = Collections.emptyList();
        if (includeVideos) {
            videoDtos = pvList.stream()
                    .map(pv -> mapVideoToResponse(pv, currentUserId))
                    .collect(Collectors.toList());
        }

        return PlaylistResponse.builder()
                .id(playlist.getId())
                .userId(playlist.getUser().getId())
                .name(playlist.getName())
                .description(playlist.getDescription())
                .coverUrl(playlist.getCoverUrl() != null && !playlist.getCoverUrl().isEmpty()
                        ? playlist.getCoverUrl()
                        : (pvList.isEmpty() ? null : resolveThumbnail(pvList.get(0).getVideoId())))
                .visibility(playlist.getVisibility().name())
                .videoCount(pvList.size())
                .videos(videoDtos)
                .user(userDto)
                .createdAt(playlist.getCreatedAt() != null ? playlist.getCreatedAt().toString() : null)
                .updatedAt(playlist.getUpdatedAt() != null ? playlist.getUpdatedAt().toString() : null)
                .build();
    }

    private PlaylistVideoResponse mapVideoToResponse(PlaylistVideo pv, Long currentUserId) {
        String videoId = pv.getVideoId();
        String videoUrl = null;
        String thumbUrl = null;
        String caption = null;
        Double duration = null;
        Long views = 0L;
        Long likes = 0L;
        Long comments = 0L;
        Long shares = 0L;
        UserResponse author = null;
        AudioTrackResponse music = null;

        // Try parsing as Long for Reel
        try {
            Long reelId = Long.parseLong(videoId);
            Optional<Reel> reelOpt = reelRepository.findById(reelId);
            if (reelOpt.isPresent()) {
                Reel r = reelOpt.get();
                videoUrl = r.getVideoUrl();
                thumbUrl = r.getThumbnailUrl();
                caption = r.getCaption();
                duration = r.getDuration();
                views = r.getViewCount();
                likes = r.getLikesCount();
                comments = r.getCommentsCount();
                shares = r.getSharesCount();
                author = authService.mapToUserResponse(r.getUser(), currentUserId);
                if (r.getAudioTrack() != null) {
                    music = AudioTrackResponse.builder()
                            .id(r.getAudioTrack().getId())
                            .title(r.getAudioTrack().getTitle())
                            .artist(r.getAudioTrack().getArtist())
                            .audioUrl(r.getAudioTrack().getAudioUrl())
                            .coverUrl(r.getAudioTrack().getCoverUrl())
                            .duration(r.getAudioTrack().getDuration())
                            .build();
                }
            }
        } catch (NumberFormatException ignored) {}

        // Fallback: check ShortVideo
        if (videoUrl == null) {
            Optional<ShortVideo> svOpt = shortVideoRepository.findByVideoId(videoId);
            if (svOpt.isPresent()) {
                ShortVideo sv = svOpt.get();
                videoUrl = sv.getFileUrl();
                duration = sv.getDuration();
                caption = "Video " + sv.getVideoId();
                if (sv.getUser() != null) {
                    author = authService.mapToUserResponse(sv.getUser(), currentUserId);
                }
            }
        }

        return PlaylistVideoResponse.builder()
                .id(pv.getId())
                .playlistId(pv.getPlaylist().getId())
                .videoId(pv.getVideoId())
                .position(pv.getPosition())
                .addedAt(pv.getAddedAt() != null ? pv.getAddedAt().toString() : null)
                .videoUrl(videoUrl != null ? videoUrl : videoId)
                .thumbnailUrl(thumbUrl != null ? thumbUrl : "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400")
                .caption(caption != null ? caption : "Video #" + pv.getPosition())
                .duration(duration != null ? duration : 20.0)
                .views(views)
                .likesCount(likes)
                .commentsCount(comments)
                .sharesCount(shares)
                .user(author)
                .music(music)
                .build();
    }

    private String resolveThumbnail(String videoId) {
        try {
            Long reelId = Long.parseLong(videoId);
            Optional<Reel> r = reelRepository.findById(reelId);
            if (r.isPresent() && r.get().getThumbnailUrl() != null) {
                return r.get().getThumbnailUrl();
            }
        } catch (Exception ignored) {}
        return null;
    }
}
