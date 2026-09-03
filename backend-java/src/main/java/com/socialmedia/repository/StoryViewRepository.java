package com.socialmedia.repository;

import com.socialmedia.entity.Story;
import com.socialmedia.entity.StoryView;
import com.socialmedia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoryViewRepository extends JpaRepository<StoryView, Long> {
    boolean existsByStoryAndUser(Story story, User user);
}
