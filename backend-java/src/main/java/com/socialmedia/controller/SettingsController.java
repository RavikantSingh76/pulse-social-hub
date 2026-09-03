package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    @PutMapping("/privacy")
    public ResponseEntity<ApiResponse<UserResponse>> updatePrivacy(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateProfileRequest request) {

        UserResponse user = settingsService.updatePrivacy(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Privacy settings updated", user));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody ChangePasswordRequest request) {

        settingsService.changePassword(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", "OK"));
    }

    @GetMapping("/activity")
    public ResponseEntity<ApiResponse<UserActivityResponse>> getUserActivity(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        UserActivityResponse activity = settingsService.getUserActivity(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(activity));
    }
}
