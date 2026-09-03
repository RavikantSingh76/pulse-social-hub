package com.socialmedia.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_preferences", indexes = {
        @Index(name = "idx_notif_pref_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "notify_likes", nullable = false)
    @Builder.Default
    private Boolean notifyLikes = true;

    @Column(name = "notify_comments", nullable = false)
    @Builder.Default
    private Boolean notifyComments = true;

    @Column(name = "notify_followers", nullable = false)
    @Builder.Default
    private Boolean notifyFollowers = true;

    @Column(name = "notify_messages", nullable = false)
    @Builder.Default
    private Boolean notifyMessages = true;

    @Column(name = "notify_mentions", nullable = false)
    @Builder.Default
    private Boolean notifyMentions = true;

    @Column(name = "notify_stories", nullable = false)
    @Builder.Default
    private Boolean notifyStories = true;
}
