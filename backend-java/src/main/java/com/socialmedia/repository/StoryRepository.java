package com.socialmedia.repository;

import com.socialmedia.entity.Story;
import com.socialmedia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {
    List<Story> findByExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime now);
    List<Story> findByUserAndExpiresAtAfterOrderByCreatedAtDesc(User user, LocalDateTime now);
}
