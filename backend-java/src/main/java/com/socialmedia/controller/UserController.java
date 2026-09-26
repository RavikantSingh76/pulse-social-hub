package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile/{username}")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(
            @PathVariable String username,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
            UserResponse response = userService.getProfile(username, currentUserId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateProfileRequest req) {
        try {
            UserResponse response = userService.updateProfile(userPrincipal.getId(), req);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully!", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/avatar")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAvatar(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("avatar") MultipartFile file) {
        try {
            if (file.isEmpty()) return ResponseEntity.badRequest().body(ApiResponse.error("No file uploaded"));
            String filename = saveFile(file);
            String avatarUrl = "/uploads/" + filename;
            userService.updateProfile(userPrincipal.getId(), UpdateProfileRequest.builder().avatarUrl(avatarUrl).build());
            return ResponseEntity.ok(ApiResponse.success(Map.of("avatar_url", avatarUrl)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/cover")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadCover(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("cover") MultipartFile file) {
        try {
            if (file.isEmpty()) return ResponseEntity.badRequest().body(ApiResponse.error("No file uploaded"));
            String filename = saveFile(file);
            String coverUrl = "/uploads/" + filename;
            userService.updateProfile(userPrincipal.getId(), UpdateProfileRequest.builder().coverUrl(coverUrl).build());
            return ResponseEntity.ok(ApiResponse.success(Map.of("cover_url", coverUrl)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<ApiResponse<Map<String, Object>>> followUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        try {
            Map<String, Object> res = userService.followUser(userPrincipal.getId(), id);
            return ResponseEntity.ok(ApiResponse.success(res));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/follow")
    public ResponseEntity<ApiResponse<String>> unfollowUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        try {
            userService.unfollowUser(userPrincipal.getId(), id);
            return ResponseEntity.ok(ApiResponse.success("Unfollowed successfully.", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getFollowers(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        return ResponseEntity.ok(ApiResponse.success(userService.getFollowers(id, currentUserId)));
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getFollowing(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        return ResponseEntity.ok(ApiResponse.success(userService.getFollowing(id, currentUserId)));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getFollowRequests(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(ApiResponse.success(userService.getFollowRequests(userPrincipal.getId())));
    }

    @PostMapping("/requests/{requesterId}/accept")
    public ResponseEntity<ApiResponse<String>> acceptRequest(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long requesterId) {
        userService.acceptFollowRequest(userPrincipal.getId(), requesterId);
        return ResponseEntity.ok(ApiResponse.success("Follow request accepted.", "OK"));
    }

    @DeleteMapping("/requests/{requesterId}/reject")
    public ResponseEntity<ApiResponse<String>> rejectRequest(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long requesterId) {
        userService.rejectFollowRequest(userPrincipal.getId(), requesterId);
        return ResponseEntity.ok(ApiResponse.success("Follow request rejected.", "OK"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(
            @RequestParam("q") String q,
            @RequestParam(value = "limit", defaultValue = "20") int limit,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        return ResponseEntity.ok(ApiResponse.success(userService.searchUsers(q, currentUserId, limit)));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getSuggestions(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "limit", defaultValue = "5") int limit) {
        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        return ResponseEntity.ok(ApiResponse.success(userService.getSuggestions(currentUserId, limit)));
    }

    @PostMapping("/{id}/block")
    public ResponseEntity<ApiResponse<String>> blockUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        userService.blockUser(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("User blocked.", "OK"));
    }

    @DeleteMapping("/{id}/block")
    public ResponseEntity<ApiResponse<String>> unblockUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        userService.unblockUser(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("User unblocked.", "OK"));
    }

    private String saveFile(MultipartFile file) throws IOException {
        return com.socialmedia.util.FileUploadSecurityUtil.storeImageFilename(file, "./uploads");
    }
}
