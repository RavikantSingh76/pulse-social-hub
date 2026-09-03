package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    @Autowired
    private PostService postService;

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
}
