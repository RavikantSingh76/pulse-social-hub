package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest req) {
        try {
            AuthResponse response = authService.register(req);
            return ResponseEntity.ok(ApiResponse.success("Account created successfully!", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest req) {
        try {
            AuthResponse response = authService.login(req);
            return ResponseEntity.ok(ApiResponse.success("Welcome back!", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            if (userPrincipal == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("Unauthenticated"));
            }
            UserResponse user = authService.getCurrentUser(userPrincipal.getId());
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> forgotPassword(
            @RequestParam(value = "email", required = false) String emailParam,
            @RequestBody(required = false) ForgotPasswordRequest req) {
        try {
            String email = req != null && req.getEmail() != null ? req.getEmail() : emailParam;
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Email parameter is required."));
            }
            String otp = authService.sendOtpToEmail(email);
            return ResponseEntity.ok(ApiResponse.success("OTP sent successfully to your email!", java.util.Map.of(
                    "email", email,
                    "otp", otp,
                    "expiresIn", "10 minutes"
            )));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            if (request == null || request.getEmail() == null || request.getOtp() == null || request.getNewPassword() == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Email, OTP, and new password are required."));
            }
            boolean isReset = authService.verifyOtpAndResetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
            if (isReset) {
                return ResponseEntity.ok(ApiResponse.success("Password reset successfully! You can now sign in with your new password.", "OK"));
            }
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired OTP."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
