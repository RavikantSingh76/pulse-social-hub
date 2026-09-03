package com.socialmedia.repository;

import com.socialmedia.entity.Conversation;
import com.socialmedia.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationOrderByCreatedAtAsc(Conversation conversation);
    @Query("SELECT COUNT(m) FROM Message m JOIN m.conversation.members cm WHERE cm.user.id = :userId AND m.sender.id != :userId AND m.isRead = false")
    long countUnreadMessages(@Param("userId") Long userId);
}
