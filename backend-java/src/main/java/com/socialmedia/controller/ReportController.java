package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.ApiResponse;
import com.socialmedia.entity.Comment;
import com.socialmedia.entity.Post;
import com.socialmedia.entity.Report;
import com.socialmedia.entity.User;
import com.socialmedia.repository.CommentRepository;
import com.socialmedia.repository.PostRepository;
import com.socialmedia.repository.ReportRepository;
import com.socialmedia.repository.UserRepository;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<String>> submitReport(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, Object> body) {
        try {
            User reporter = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("Reporter not found"));

            String reason = (String) body.getOrDefault("reason", "Inappropriate Content");
            String details = (String) body.getOrDefault("details", "");

            Report.ReportBuilder builder = Report.builder()
                    .reporter(reporter)
                    .reason(reason)
                    .details(details)
                    .status(Report.Status.PENDING);

            if (body.get("postId") != null) {
                Long postId = Long.valueOf(body.get("postId").toString());
                Post post = postRepository.findById(postId).orElse(null);
                builder.reportedPost(post);
            }

            if (body.get("userId") != null) {
                Long userId = Long.valueOf(body.get("userId").toString());
                User reportedUser = userRepository.findById(userId).orElse(null);
                builder.reportedUser(reportedUser);
            }

            if (body.get("commentId") != null) {
                Long commentId = Long.valueOf(body.get("commentId").toString());
                Comment comment = commentRepository.findById(commentId).orElse(null);
                builder.reportedComment(comment);
            }

            Report report = builder.build();
            reportRepository.save(report);

            return ResponseEntity.ok(ApiResponse.success("Thank you for your report. Our moderation team will review this shortly.", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
