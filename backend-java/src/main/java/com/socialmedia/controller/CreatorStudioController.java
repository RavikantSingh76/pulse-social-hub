package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/creator/studio")
public class CreatorStudioController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<CreatorStudioOverviewResponse>> getOverview(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CreatorStudioOverviewResponse overview = userService.getCreatorStudioOverview(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(overview));
    }
}
