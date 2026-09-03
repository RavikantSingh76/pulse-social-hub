package com.socialmedia.repository;

import com.socialmedia.entity.Conversation;
import com.socialmedia.entity.ConversationMember;
import com.socialmedia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationMemberRepository extends JpaRepository<ConversationMember, Long> {
    Optional<ConversationMember> findByConversationAndUser(Conversation conversation, User user);
}
