package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<PostResponse>> createPostJson(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CreatePostRequest req) {

        PostResponse post = postService.createPost(
                userPrincipal.getId(),
                req.getCaption(),
                req.getVisibility() != null ? req.getVisibility() : "PUBLIC",
                req.getPostType() != null ? req.getPostType() : "POST",
                req.getTitle(),
                null
        );
        return ResponseEntity.ok(ApiResponse.success("Post created successfully", post));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "visibility", defaultValue = "PUBLIC") String visibility,
            @RequestParam(value = "post_type", defaultValue = "POST") String postType,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "media", required = false) List<MultipartFile> media) {

        PostResponse post = postService.createPost(userPrincipal.getId(), caption, visibility, postType, title, media);
        return ResponseEntity.ok(ApiResponse.success("Post created successfully", post));
    }

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFeed(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "type", defaultValue = "FOR_YOU") String type,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        List<PostResponse> posts = postService.getFeedByType(currentUserId, type, page, limit);
        return ResponseEntity.ok(ApiResponse.success(Map.of("posts", posts, "page", page, "limit", limit, "type", type)));
    }

    @GetMapping(path = {"/reels", "/feed/reels"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReels(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "12") int limit) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        List<PostResponse> reels = postService.getFeedByType(currentUserId, "REELS", page, limit);
        return ResponseEntity.ok(ApiResponse.success(Map.of("reels", reels, "page", page, "limit", limit)));
    }

    @GetMapping("/explore")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getExplore(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "18") int limit) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        List<PostResponse> posts = postService.getExplore(currentUserId, page, limit);
        return ResponseEntity.ok(ApiResponse.success(Map.of("posts", posts, "page", page, "limit", limit)));
    }

    @GetMapping(path = {"/hashtags/{tag}", "/hashtag/{tag}"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHashtagPosts(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String tag,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "18") int limit) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        List<PostResponse> posts = postService.getHashtagPosts(tag, currentUserId, page, limit);
        return ResponseEntity.ok(ApiResponse.success(Map.of("posts", posts, "page", page, "limit", limit, "tag", tag)));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserPosts(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String username,
            @RequestParam(value = "tab", defaultValue = "posts") String tab,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "12") int limit) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        List<PostResponse> posts = postService.getUserPosts(username, tab, page, limit, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("posts", posts, "page", page, "limit", limit, "tab", tab)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPost(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        PostResponse post = postService.getPostById(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(post));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestBody CreatePostRequest req) {

        PostResponse post = postService.updatePost(userPrincipal.getId(), id, req.getCaption(), req.getVisibility());
        return ResponseEntity.ok(ApiResponse.success("Post updated", post));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deletePost(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        postService.deletePost(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Post deleted", "OK"));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleLike(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        Map<String, Object> res = postService.toggleLike(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping(path = {"/{id}/reactions", "/{id}/reaction"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPostReactions(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        Map<String, Object> res = postService.getPostReactionsSummary(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PostMapping(path = {"/{id}/reactions", "/{id}/reaction"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleReaction(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestBody(required = false) ReactionRequest req) {

        String type = req != null ? req.getReactionType() : "LIKE";
        Map<String, Object> res = postService.toggleReaction(userPrincipal.getId(), id, type);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleSave(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam(value = "collectionId", required = false) Long collectionId) {

        Map<String, Object> res = postService.savePostToCollection(userPrincipal.getId(), id, collectionId);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PostMapping("/{id}/report")
    public ResponseEntity<ApiResponse<String>> reportPost(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestBody ReportRequest req) {

        postService.reportPost(userPrincipal.getId(), id, req);
        return ResponseEntity.ok(ApiResponse.success("Post reported for moderation review", "OK"));
    }

    // Collections
    @GetMapping("/collections")
    public ResponseEntity<ApiResponse<List<SavedCollectionResponse>>> getUserCollections(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        List<SavedCollectionResponse> collections = postService.getUserCollections(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(collections));
    }

    @PostMapping("/collections")
    public ResponseEntity<ApiResponse<SavedCollectionResponse>> createCollection(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CreateCollectionRequest req) {

        SavedCollectionResponse res = postService.createCollection(userPrincipal.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("Collection created", res));
    }

    @PostMapping("/{id}/not-interested")
    public ResponseEntity<ApiResponse<String>> markNotInterested(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam(value = "reason", required = false) String reason) {

        postService.recordNotInterested(userPrincipal.getId(), id, reason);
        return ResponseEntity.ok(ApiResponse.success("Marked as Not Interested. Feed updated.", "OK"));
    }
}
