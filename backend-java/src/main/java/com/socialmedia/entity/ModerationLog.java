package com.socialmedia.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "moderation_logs", indexes = {
        @Index(name = "idx_mod_admin", columnList = "admin_id"),
        @Index(name = "idx_mod_target_user", columnList = "target_user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModerationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id")
    private User targetUser;

    @Column(name = "target_post_id")
    private Long targetPostId;

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType; // WARN_USER, SUSPEND_USER, UNSUSPEND_USER, VERIFY_USER, UNVERIFY_USER, DELETE_POST, RESOLVE_REPORT, DISMISS_REPORT

    @Column(columnDefinition = "TEXT")
    private String reason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
