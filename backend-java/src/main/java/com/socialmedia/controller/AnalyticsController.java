package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private UserService userService;

    @GetMapping("/creator/{username}")
    public ResponseEntity<ApiResponse<CreatorAnalyticsResponse>> getCreatorAnalytics(
            @PathVariable String username) {

        CreatorAnalyticsResponse analytics = userService.getCreatorAnalytics(username);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}
