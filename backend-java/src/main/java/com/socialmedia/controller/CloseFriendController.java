package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.CloseFriendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/close-friends")
public class CloseFriendController {

    @Autowired
    private CloseFriendService closeFriendService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getCloseFriends(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<UserResponse> list = closeFriendService.getCloseFriends(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/{friendId}")
    public ResponseEntity<ApiResponse<String>> addCloseFriend(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long friendId) {
        closeFriendService.addCloseFriend(userPrincipal.getId(), friendId);
        return ResponseEntity.ok(ApiResponse.success("Added to Close Friends", "OK"));
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<ApiResponse<String>> removeCloseFriend(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long friendId) {
        closeFriendService.removeCloseFriend(userPrincipal.getId(), friendId);
        return ResponseEntity.ok(ApiResponse.success("Removed from Close Friends", "OK"));
    }
}
