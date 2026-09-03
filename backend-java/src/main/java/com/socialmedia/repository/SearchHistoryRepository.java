package com.socialmedia.repository;

import com.socialmedia.entity.SearchHistory;
import com.socialmedia.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    List<SearchHistory> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    void deleteByUser(User user);
    void deleteByIdAndUser(Long id, User user);

    @Query("SELECT s.queryText, COUNT(s) as cnt FROM SearchHistory s GROUP BY s.queryText ORDER BY cnt DESC")
    List<Object[]> findTrendingSearches(Pageable pageable);
}
