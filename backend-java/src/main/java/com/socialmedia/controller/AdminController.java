package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.Report;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "30") int limit) {
        return ResponseEntity.ok(ApiResponse.success(adminService.listUsers(page, limit)));
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleUserStatus(
            @AuthenticationPrincipal UserPrincipal admin,
            @PathVariable Long id) {
        Map<String, Object> res = adminService.toggleUserStatus(id, admin.getId());
        return ResponseEntity.ok(ApiResponse.success("User status updated", res));
    }

    @PutMapping("/users/{id}/verify")
    public ResponseEntity<ApiResponse<UserResponse>> verifyUser(
            @AuthenticationPrincipal UserPrincipal admin,
            @PathVariable Long id,
            @RequestParam(value = "verified", defaultValue = "true") boolean verified) {
        UserResponse user = adminService.verifyUser(admin.getId(), id, verified);
        return ResponseEntity.ok(ApiResponse.success("User verification updated", user));
    }

    @PostMapping("/users/{id}/warn")
    public ResponseEntity<ApiResponse<String>> warnUser(
            @AuthenticationPrincipal UserPrincipal admin,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String msg = body.getOrDefault("message", "Policy violation warning");
        adminService.warnUser(admin.getId(), id, msg);
        return ResponseEntity.ok(ApiResponse.success("Warning issued", "OK"));
    }

    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<List<PostResponse>>> listPosts(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "30") int limit) {
        return ResponseEntity.ok(ApiResponse.success(adminService.listPosts(page, limit)));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<Report>>> listReports(
            @RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(adminService.listReports(status)));
    }

    @PutMapping("/reports/{id}/resolve")
    public ResponseEntity<ApiResponse<String>> resolveReport(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        adminService.resolveReport(id, body.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Report marked as " + body.get("status"), "OK"));
    }
}
