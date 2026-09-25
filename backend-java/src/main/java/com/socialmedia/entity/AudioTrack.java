package com.socialmedia.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audio_tracks", indexes = {
    @Index(name = "idx_audio_title", columnList = "title"),
    @Index(name = "idx_audio_artist", columnList = "artist"),
    @Index(name = "idx_audio_usage_count", columnList = "usage_count"),
    @Index(name = "idx_audio_is_active", columnList = "is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioTrack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 128)
    private String title;

    @Column(nullable = false, length = 128)
    private String artist;

    @Column(name = "audio_url", nullable = false, length = 512)
    private String audioUrl;

    @Column(name = "cover_url", length = 512)
    private String coverUrl;

    @Column(nullable = false)
    private Double duration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 32)
    @Builder.Default
    private SourceType sourceType = SourceType.PLATFORM;

    @Enumerated(EnumType.STRING)
    @Column(name = "license_type", nullable = false, length = 32)
    @Builder.Default
    private LicenseType licenseType = LicenseType.ROYALTY_FREE;

    @Column(name = "copyright_owner", length = 128)
    private String copyrightOwner;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private Boolean isPublic = true;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "usage_count", nullable = false)
    @Builder.Default
    private Long usageCount = 0L;

    @Column(length = 64)
    private String genre;

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

    public enum SourceType {
        PLATFORM,
        ORIGINAL,
        LICENSED,
        USER_UPLOADED
    }

    public enum LicenseType {
        ROYALTY_FREE,
        CREATIVE_COMMONS,
        PROPRIETARY,
        STANDARD
    }
}
