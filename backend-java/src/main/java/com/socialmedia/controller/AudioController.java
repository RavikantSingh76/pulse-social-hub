package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.AudioTrackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/audio")
public class AudioController {

    @Autowired
    private AudioTrackService audioTrackService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AudioTrackResponse>>> getAudioList(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "20") int limit) {

        List<AudioTrackResponse> tracks = audioTrackService.getTrendingAudio(page, limit);
        return ResponseEntity.ok(ApiResponse.success(tracks));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<AudioTrackResponse>>> searchAudio(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "20") int limit) {

        List<AudioTrackResponse> tracks = audioTrackService.searchAudio(query, page, limit);
        return ResponseEntity.ok(ApiResponse.success(tracks));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<AudioTrackResponse>>> getTrending(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "20") int limit) {

        List<AudioTrackResponse> tracks = audioTrackService.getTrendingAudio(page, limit);
        return ResponseEntity.ok(ApiResponse.success(tracks));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<AudioTrackResponse>>> getRecent(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "20") int limit) {

        List<AudioTrackResponse> tracks = audioTrackService.getRecentAudio(page, limit);
        return ResponseEntity.ok(ApiResponse.success(tracks));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AudioTrackResponse>> getAudioById(@PathVariable Long id) {
        AudioTrackResponse track = audioTrackService.getAudioById(id);
        return ResponseEntity.ok(ApiResponse.success(track));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AudioTrackResponse>> uploadAudioTrack(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("title") String title,
            @RequestParam("artist") String artist,
            @RequestParam(value = "duration", required = false) Double duration,
            @RequestParam(value = "genre", defaultValue = "All") String genre,
            @RequestParam(value = "source_type", defaultValue = "USER_UPLOADED") String sourceType,
            @RequestParam(value = "license_type", defaultValue = "ROYALTY_FREE") String licenseType,
            @RequestParam(value = "copyright_owner", required = false) String copyrightOwner,
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam(value = "cover", required = false) MultipartFile coverFile) {

        Long userId = userPrincipal != null ? userPrincipal.getId() : null;
        AudioTrackResponse res = audioTrackService.uploadAudioTrack(
                userId, title, artist, duration, genre, sourceType, licenseType, copyrightOwner, audioFile, coverFile);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Audio track uploaded successfully", res));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteAudioTrack(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        audioTrackService.deleteAudioTrack(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Audio track deleted", "OK"));
    }
}
