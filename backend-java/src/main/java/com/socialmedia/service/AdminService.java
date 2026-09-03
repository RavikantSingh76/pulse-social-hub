package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.*;
import com.socialmedia.repository.*;
import com.socialmedia.websocket.WebSocketConfig.ChatWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ModerationLogRepository moderationLogRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ChatWebSocketHandler wsHandler;

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsSuspendedFalse();
        long totalPosts = postRepository.count();
        long totalVideos = postRepository.countByPostType(Post.PostType.VIDEO);
        long totalReports = reportRepository.count();
        long pendingReports = reportRepository.countByStatus(Report.Status.PENDING);
        long totalConvs = conversationRepository.count();

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalPosts(totalPosts)
                .totalVideos(totalVideos)
                .totalReports(totalReports)
                .pendingReports(pendingReports)
                .totalConversations(totalConvs)
                .build();
    }

    @Transactional
    public UserResponse verifyUser(Long adminId, Long targetUserId, boolean isVerified) {
        User admin = userRepository.findById(adminId).orElseThrow(() -> new RuntimeException("Admin not found"));
        User user = userRepository.findById(targetUserId).orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsVerified(isVerified);
        userRepository.save(user);

        ModerationLog log = ModerationLog.builder()
                .admin(admin)
                .targetUser(user)
                .actionType(isVerified ? "VERIFY_USER" : "UNVERIFY_USER")
                .reason(isVerified ? "Account verified by admin" : "Verification removed")
                .build();
        moderationLogRepository.save(log);

        return userService.mapToUserResponse(user, adminId);
    }

    @Transactional
    public void warnUser(Long adminId, Long targetUserId, String warningMessage) {
        User admin = userRepository.findById(adminId).orElseThrow(() -> new RuntimeException("Admin not found"));
        User user = userRepository.findById(targetUserId).orElseThrow(() -> new RuntimeException("User not found"));

        Notification notif = Notification.builder()
                .recipient(user)
                .actor(admin)
                .type(Notification.Type.SYSTEM)
                .message("⚠️ Official Warning from Administration: " + warningMessage)
                .build();
        notificationRepository.save(notif);
        wsHandler.sendNotificationToUser(user.getId(), notif.getMessage());

        ModerationLog log = ModerationLog.builder()
                .admin(admin)
                .targetUser(user)
                .actionType("WARN_USER")
                .reason(warningMessage)
                .build();
        moderationLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers(int page, int limit) {
        return userRepository.findAll(PageRequest.of(page - 1, limit))
                .stream()
                .map(u -> userService.mapToUserResponse(u, null))
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> toggleUserStatus(Long userId, Long adminId) {
        User admin = userRepository.findById(adminId).orElseThrow(() -> new RuntimeException("Admin not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        boolean newSuspended = !Boolean.TRUE.equals(user.getIsSuspended());
        user.setIsSuspended(newSuspended);
        userRepository.save(user);

        ModerationLog log = ModerationLog.builder()
                .admin(admin)
                .targetUser(user)
                .actionType(newSuspended ? "SUSPEND_USER" : "UNSUSPEND_USER")
                .reason(newSuspended ? "Account suspended for policy violations" : "Account unsuspended")
                .build();
        moderationLogRepository.save(log);

        return Map.of("userId", user.getId(), "isSuspended", newSuspended);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> listPosts(int page, int limit) {
        return postRepository.findAll(PageRequest.of(page - 1, limit))
                .stream()
                .map(p -> postService.mapToPostResponse(p, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Report> listReports(String status) {
        if (status != null && !status.isBlank()) {
            return reportRepository.findByStatusOrderByCreatedAtDesc(Report.Status.valueOf(status.toUpperCase()));
        }
        return reportRepository.findAll();
    }

    @Transactional
    public void resolveReport(Long reportId, String status) {
        Report report = reportRepository.findById(reportId).orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(Report.Status.valueOf(status.toUpperCase()));
        reportRepository.save(report);
    }
}
