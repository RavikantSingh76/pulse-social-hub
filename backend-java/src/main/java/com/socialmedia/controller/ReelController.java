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
@RequestMapping("/api/reels")
public class ReelController {

    @Autowired
    private PostService postService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReels(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        List<PostResponse> reels = postService.getFeedByType(currentUserId, "REELS", page, limit);
        return ResponseEntity.ok(ApiResponse.success(Map.of("reels", reels, "page", page, "limit", limit)));
    }
}
