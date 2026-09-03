package com.socialmedia.repository;

import com.socialmedia.entity.StoryHighlight;
import com.socialmedia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoryHighlightRepository extends JpaRepository<StoryHighlight, Long> {
    List<StoryHighlight> findByUserOrderByCreatedAtDesc(User user);
}
