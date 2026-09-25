package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.ReelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/reels")
public class ReelController {

    @Autowired
    private ReelService reelService;

    @GetMapping
    public ResponseEntity<ApiResponse<ReelFeedResponse>> getReels(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        ReelFeedResponse feed = reelService.getFeedReels(page, limit, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(feed));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReelResponse>> getReelById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        ReelResponse reel = reelService.getReelById(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(reel));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ReelResponse>> createReel(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("video") MultipartFile videoFile,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "music_id", required = false) Long musicId,
            @RequestParam(value = "audio_start_time", defaultValue = "0.0") Double audioStartTime,
            @RequestParam(value = "audio_end_time", defaultValue = "20.0") Double audioEndTime,
            @RequestParam(value = "original_audio_volume", defaultValue = "100") Integer originalAudioVolume,
            @RequestParam(value = "music_volume", defaultValue = "80") Integer musicVolume,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnailFile,
            @RequestParam(value = "thumbnail_url", required = false) String thumbnailUrl) {

        ReelResponse created = reelService.createReel(
                userPrincipal.getId(),
                videoFile,
                caption,
                musicId,
                audioStartTime,
                audioEndTime,
                originalAudioVolume,
                musicVolume,
                thumbnailFile,
                thumbnailUrl
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reel created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReelResponse>> updateReel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateReelRequest req) {

        ReelResponse updated = reelService.updateReel(id, userPrincipal.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("Reel updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteReel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        reelService.deleteReel(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Reel deleted successfully", "OK"));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<String>> recordView(@PathVariable Long id) {
        reelService.recordView(id);
        return ResponseEntity.ok(ApiResponse.success("View recorded", "OK"));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<String>> toggleLike(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        reelService.toggleLike(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Liked reel", "OK"));
    }
}
