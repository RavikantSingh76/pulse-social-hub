package com.socialmedia.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reels", indexes = {
    @Index(name = "idx_reel_user", columnList = "user_id"),
    @Index(name = "idx_reel_status", columnList = "status"),
    @Index(name = "idx_reel_created_at", columnList = "created_at"),
    @Index(name = "idx_reel_checksum", columnList = "checksum_sha256")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "video_url", nullable = false, length = 512)
    private String videoUrl;

    @Column(name = "storage_path", length = 512)
    private String storagePath;

    @Column(name = "thumbnail_url", length = 512)
    private String thumbnailUrl;

    @Column(columnDefinition = "TEXT")
    private String caption;

    @Column(nullable = false)
    private Double duration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audio_track_id")
    private AudioTrack audioTrack;

    @Column(name = "audio_start_time")
    @Builder.Default
    private Double audioStartTime = 0.0;

    @Column(name = "audio_end_time")
    @Builder.Default
    private Double audioEndTime = 20.0;

    @Column(name = "original_audio_volume", nullable = false)
    @Builder.Default
    private Integer originalAudioVolume = 100;

    @Column(name = "music_volume", nullable = false)
    @Builder.Default
    private Integer musicVolume = 80;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Long viewCount = 0L;

    @Column(name = "likes_count", nullable = false)
    @Builder.Default
    private Long likesCount = 0L;

    @Column(name = "comments_count", nullable = false)
    @Builder.Default
    private Long commentsCount = 0L;

    @Column(name = "shares_count", nullable = false)
    @Builder.Default
    private Long sharesCount = 0L;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private ReelStatus status = ReelStatus.PROCESSING;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "checksum_sha256", length = 64)
    private String checksumSha256;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ReelStatus {
        UPLOADING,
        PROCESSING,
        READY,
        FAILED
    }
}
