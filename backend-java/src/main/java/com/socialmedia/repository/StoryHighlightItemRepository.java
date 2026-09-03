package com.socialmedia.repository;

import com.socialmedia.entity.StoryHighlight;
import com.socialmedia.entity.StoryHighlightItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoryHighlightItemRepository extends JpaRepository<StoryHighlightItem, Long> {
    List<StoryHighlightItem> findByHighlightOrderByOrderIndexAsc(StoryHighlight highlight);
}
