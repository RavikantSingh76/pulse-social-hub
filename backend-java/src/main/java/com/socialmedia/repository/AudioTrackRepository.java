package com.socialmedia.repository;

import com.socialmedia.entity.AudioTrack;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AudioTrackRepository extends JpaRepository<AudioTrack, Long> {

    @Query("SELECT a FROM AudioTrack a WHERE a.isActive = true AND a.isPublic = true ORDER BY a.usageCount DESC, a.createdAt DESC")
    Page<AudioTrack> findTrendingTracks(Pageable pageable);

    @Query("SELECT a FROM AudioTrack a WHERE a.isActive = true AND a.isPublic = true AND (" +
           "LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.artist) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.genre) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<AudioTrack> searchTracks(@Param("query") String query, Pageable pageable);

    @Query("SELECT a FROM AudioTrack a WHERE a.isActive = true AND a.isPublic = true ORDER BY a.createdAt DESC")
    Page<AudioTrack> findRecentTracks(Pageable pageable);

    @Modifying
    @Query("UPDATE AudioTrack a SET a.usageCount = a.usageCount + 1 WHERE a.id = :id")
    void incrementUsageCount(@Param("id") Long id);

    List<AudioTrack> findByGenreIgnoreCaseAndIsActiveTrue(String genre, Pageable pageable);
}
