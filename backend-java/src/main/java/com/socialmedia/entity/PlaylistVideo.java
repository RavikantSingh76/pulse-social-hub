package com.socialmedia.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "playlist_videos",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_playlist_video", columnNames = {"playlist_id", "video_id"})
    },
    indexes = {
        @Index(name = "idx_pv_playlist", columnList = "playlist_id"),
        @Index(name = "idx_pv_video", columnList = "video_id"),
        @Index(name = "idx_pv_position", columnList = "playlist_id, position")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaylistVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", nullable = false)
    private Playlist playlist;

    @Column(name = "video_id", nullable = false, length = 64)
    private String videoId;

    @Column(nullable = false)
    private Integer position;

    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;

    @PrePersist
    protected void onCreate() {
        if (addedAt == null) {
            addedAt = LocalDateTime.now();
        }
    }
}
