package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.StoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    @Autowired
    private StoryService storyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StoryResponse>>> getStories(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        List<StoryResponse> stories = storyService.getActiveStories(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(stories));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<StoryResponse>> createStory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("media") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "audience", required = false) String audience) {

        StoryResponse story = storyService.createStory(userPrincipal.getId(), file, caption, audience);
        return ResponseEntity.ok(ApiResponse.success("Story created successfully", story));
    }

    @PostMapping("/text")
    public ResponseEntity<ApiResponse<StoryResponse>> createTextStory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CreateTextStoryRequest req) {

        StoryResponse story = storyService.createTextStory(userPrincipal.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("Text story created", story));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<String>> recordView(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        storyService.recordView(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("View recorded", "OK"));
    }

    @PostMapping("/{id}/react")
    public ResponseEntity<ApiResponse<String>> reactToStory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam("emoji") String emoji) {

        storyService.reactToStory(userPrincipal.getId(), id, emoji);
        return ResponseEntity.ok(ApiResponse.success("Story reaction sent", "OK"));
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<ApiResponse<String>> replyToStory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String text = body.getOrDefault("text", "");
        storyService.replyToStory(userPrincipal.getId(), id, text);
        return ResponseEntity.ok(ApiResponse.success("Story reply sent", "OK"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteStory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        storyService.deleteStory(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Story deleted", "OK"));
    }

    // Highlights
    @GetMapping("/highlights/{username}")
    public ResponseEntity<ApiResponse<List<StoryHighlightResponse>>> getUserHighlights(
            @PathVariable String username) {

        List<StoryHighlightResponse> highlights = storyService.getUserHighlights(username);
        return ResponseEntity.ok(ApiResponse.success(highlights));
    }

    @PostMapping("/highlights")
    public ResponseEntity<ApiResponse<StoryHighlightResponse>> createHighlight(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CreateHighlightRequest req) {

        StoryHighlightResponse highlight = storyService.createHighlight(userPrincipal.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("Highlight created", highlight));
    }

    @DeleteMapping("/highlights/{highlightId}")
    public ResponseEntity<ApiResponse<String>> deleteHighlight(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long highlightId) {

        storyService.deleteHighlight(userPrincipal.getId(), highlightId);
        return ResponseEntity.ok(ApiResponse.success("Highlight deleted", "OK"));
    }
}
