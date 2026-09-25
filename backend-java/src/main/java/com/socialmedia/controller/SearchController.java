package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.RecommendationService;
import com.socialmedia.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<ApiResponse<UnifiedSearchResponse>> search(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "tab", defaultValue = "all") String tab,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "15") int limit) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        UnifiedSearchResponse response = searchService.search(currentUserId, query, tab, page, limit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/history")
    public ResponseEntity<ApiResponse<String>> clearHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        searchService.clearSearchHistory(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Search history cleared", "OK"));
    }

    // Recommendations
    @GetMapping(path = {"/suggested-users", "/suggested"})
    public ResponseEntity<ApiResponse<List<UserResponse>>> getSuggestedUsers(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "limit", defaultValue = "5") int limit) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        List<UserResponse> users = recommendationService.getPeopleYouMayKnow(currentUserId, limit);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/posts-you-may-like")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPostsYouMayLike(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        List<PostResponse> posts = recommendationService.getPostsYouMayLike(currentUserId, page, limit);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }
}
