package com.socialmedia.repository;

import com.socialmedia.entity.Reel;
import com.socialmedia.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReelRepository extends JpaRepository<Reel, Long> {

    @Query("SELECT r FROM Reel r WHERE r.status = 'READY' ORDER BY r.createdAt DESC")
    Page<Reel> findFeedReels(Pageable pageable);

    @Query("SELECT r FROM Reel r WHERE r.status = 'READY' AND r.user = :user ORDER BY r.createdAt DESC")
    Page<Reel> findByUser(@Param("user") User user, Pageable pageable);

    @Query("SELECT r FROM Reel r WHERE r.status = 'READY' AND r.audioTrack.id = :audioId ORDER BY r.viewCount DESC")
    Page<Reel> findByAudioTrackId(@Param("audioId") Long audioId, Pageable pageable);

    Optional<Reel> findByChecksumSha256AndUser(String checksum, User user);

    @Modifying
    @Query("UPDATE Reel r SET r.viewCount = r.viewCount + 1 WHERE r.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Reel r SET r.likesCount = r.likesCount + 1 WHERE r.id = :id")
    void incrementLikesCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Reel r SET r.likesCount = CASE WHEN r.likesCount > 0 THEN r.likesCount - 1 ELSE 0 END WHERE r.id = :id")
    void decrementLikesCount(@Param("id") Long id);

    long countByUserAndStatus(User user, Reel.ReelStatus status);
}
