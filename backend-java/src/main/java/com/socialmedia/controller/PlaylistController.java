package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.PlaylistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/playlists")
public class PlaylistController {

    @Autowired
    private PlaylistService playlistService;

    @PostMapping
    public ResponseEntity<ApiResponse<PlaylistResponse>> createPlaylist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CreatePlaylistRequest req) {

        PlaylistResponse created = playlistService.createPlaylist(userPrincipal.getId(), req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Playlist created successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PlaylistResponse>>> getPlaylists(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "user_id", required = false) Long targetUserId,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "20") int limit) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        List<PlaylistResponse> playlists;

        if (targetUserId != null) {
            playlists = playlistService.getUserPlaylists(targetUserId);
        } else if (currentUserId != null) {
            playlists = playlistService.getUserPlaylists(currentUserId);
        } else {
            playlists = playlistService.getAccessiblePlaylists(currentUserId, page, limit);
        }

        return ResponseEntity.ok(ApiResponse.success(playlists));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PlaylistResponse>> getPlaylistById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        PlaylistResponse playlist = playlistService.getPlaylistById(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(playlist));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PlaylistResponse>> updatePlaylist(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdatePlaylistRequest req) {

        PlaylistResponse updated = playlistService.updatePlaylist(id, userPrincipal.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("Playlist updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deletePlaylist(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        playlistService.deletePlaylist(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Playlist deleted successfully", "OK"));
    }

    @PostMapping("/{playlistId}/videos")
    public ResponseEntity<ApiResponse<PlaylistResponse>> addVideos(
            @PathVariable Long playlistId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody AddPlaylistVideosRequest req) {

        List<String> ids = new ArrayList<>();
        if (req.getVideoIds() != null) {
            ids.addAll(req.getVideoIds());
        }
        if (req.getVideoId() != null && !req.getVideoId().trim().isEmpty() && !ids.contains(req.getVideoId())) {
            ids.add(req.getVideoId().trim());
        }

        PlaylistResponse updated = playlistService.addVideosToPlaylist(playlistId, userPrincipal.getId(), ids);
        return ResponseEntity.ok(ApiResponse.success("Videos added to playlist successfully", updated));
    }

    @DeleteMapping("/{playlistId}/videos/{videoId}")
    public ResponseEntity<ApiResponse<PlaylistResponse>> removeVideo(
            @PathVariable Long playlistId,
            @PathVariable String videoId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        PlaylistResponse updated = playlistService.removeVideoFromPlaylist(playlistId, userPrincipal.getId(), videoId);
        return ResponseEntity.ok(ApiResponse.success("Video removed from playlist successfully", updated));
    }

    @PutMapping("/{playlistId}/videos/reorder")
    public ResponseEntity<ApiResponse<PlaylistResponse>> reorderVideos(
            @PathVariable Long playlistId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody ReorderPlaylistVideosRequest req) {

        PlaylistResponse updated = playlistService.reorderVideos(playlistId, userPrincipal.getId(), req.getVideoIds());
        return ResponseEntity.ok(ApiResponse.success("Playlist videos reordered successfully", updated));
    }
}
