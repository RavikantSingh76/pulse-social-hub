package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.PostService;
import com.socialmedia.service.ShortVideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    @Autowired
    private PostService postService;

    @Autowired
    private ShortVideoService shortVideoService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getVideos(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "12") int limit) {
        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        List<PostResponse> videos = postService.getTrendingVideos(currentUserId, page, limit);
        return ResponseEntity.ok(ApiResponse.success(Map.of("videos", videos, "page", page, "limit", limit)));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<String>> recordView(@PathVariable Long id) {
        postService.incrementViewCount(id);
        return ResponseEntity.ok(ApiResponse.success("View recorded", "OK"));
    }

    /**
     * POST /api/videos/upload
     * Accepts short video files (MP4/WebM) up to 20 seconds.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ShortVideoResponse>> uploadVideo(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("video") MultipartFile video) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: authentication required to upload video"));
        }
        try {
            ShortVideoResponse response = shortVideoService.uploadShortVideo(userPrincipal.getId(), video);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Video uploaded successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    /**
     * GET /api/videos/{videoId}/status
     * Polling endpoint for video processing status.
     */
    @GetMapping("/{videoId}/status")
    public ResponseEntity<ApiResponse<ShortVideoResponse>> getVideoStatus(@PathVariable String videoId) {
        try {
            ShortVideoResponse response = shortVideoService.getVideoByVideoId(videoId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /api/videos/{videoId}
     * Retrieves video details.
     */
    @GetMapping("/{videoId}")
    public ResponseEntity<ApiResponse<ShortVideoResponse>> getVideo(@PathVariable String videoId) {
        try {
            ShortVideoResponse response = shortVideoService.getVideoByVideoId(videoId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * DELETE /api/videos/{videoId}
     * Deletes video (Owner or Admin only).
     */
    @DeleteMapping("/{videoId}")
    public ResponseEntity<ApiResponse<Void>> deleteVideo(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String videoId) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        try {
            shortVideoService.deleteShortVideo(userPrincipal.getId(), videoId);
            return ResponseEntity.ok(ApiResponse.success("Video deleted successfully", null));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
