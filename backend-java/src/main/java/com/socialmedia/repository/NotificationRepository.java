package com.socialmedia.repository;

import com.socialmedia.entity.Notification;
import com.socialmedia.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);
    long countByRecipientAndIsReadFalse(User recipient);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient = :recipient")
    void markAllAsReadForUser(@Param("recipient") User recipient);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.entityType = 'POST' AND n.entityId = :postId")
    void deleteByPostId(@Param("postId") Long postId);

    @Modifying
    @Query("DELETE FROM Notification n WHERE (n.entityType = 'POST' AND n.entityId = :postId) OR (n.entityType = 'COMMENT' AND n.entityId IN :commentIds)")
    void deleteByPostAndCommentIds(@Param("postId") Long postId, @Param("commentIds") List<Long> commentIds);
}
