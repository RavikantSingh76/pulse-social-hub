package com.socialmedia.repository;

import com.socialmedia.entity.Hashtag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HashtagRepository extends JpaRepository<Hashtag, Long> {
    Optional<Hashtag> findByTagIgnoreCase(String tag);
    @Query("SELECT h FROM Hashtag h ORDER BY h.id DESC")
    List<Hashtag> findTrending(Pageable pageable);
}
