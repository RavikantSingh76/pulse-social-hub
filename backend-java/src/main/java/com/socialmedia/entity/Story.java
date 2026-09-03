package com.socialmedia.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stories", indexes = {
        @Index(name = "idx_story_user", columnList = "user_id"),
        @Index(name = "idx_story_expires", columnList = "expires_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Story {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "media_url", length = 500)
    private String mediaUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    @Builder.Default
    private MediaType mediaType = MediaType.IMAGE;

    @Enumerated(EnumType.STRING)
    @Column(name = "audience", length = 30)
    @Builder.Default
    private Audience audience = Audience.PUBLIC; // PUBLIC, FOLLOWERS, CLOSE_FRIENDS

    @Column(length = 1000)
    private String caption;

    @Column(name = "bg_gradient", length = 100)
    private String bgGradient; // e.g. "from-purple-600 to-pink-500"

    @Column(name = "font_family", length = 50)
    private String fontFamily;

    @Column(name = "text_color", length = 30)
    private String textColor;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StoryView> views = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (expiresAt == null) {
            expiresAt = LocalDateTime.now().plusHours(24);
        }
    }

    public enum MediaType {
        IMAGE,
        VIDEO,
        TEXT
    }

    public enum Audience {
        PUBLIC,
        FOLLOWERS,
        CLOSE_FRIENDS
    }
}
