package com.socialmedia.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reactions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_post_reaction", columnNames = {"user_id", "post_id"}),
                @UniqueConstraint(name = "uk_user_comment_reaction", columnNames = {"user_id", "comment_id"}),
                @UniqueConstraint(name = "uk_user_message_reaction", columnNames = {"user_id", "message_id"})
        },
        indexes = {
                @Index(name = "idx_reaction_post", columnList = "post_id"),
                @Index(name = "idx_reaction_comment", columnList = "comment_id"),
                @Index(name = "idx_reaction_message", columnList = "message_id"),
                @Index(name = "idx_reaction_user", columnList = "user_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private Comment comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    private Message message;

    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false, length = 20)
    private ReactionType reactionType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum ReactionType {
        LIKE,
        LOVE,
        HAHA,
        WOW,
        SAD,
        ANGRY
    }
}
