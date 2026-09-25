package com.socialmedia.repository;

import com.socialmedia.entity.PlaylistVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistVideoRepository extends JpaRepository<PlaylistVideo, Long> {

    List<PlaylistVideo> findByPlaylistIdOrderByPositionAsc(Long playlistId);

    long countByPlaylistId(Long playlistId);

    boolean existsByPlaylistIdAndVideoId(Long playlistId, String videoId);

    Optional<PlaylistVideo> findByPlaylistIdAndVideoId(Long playlistId, String videoId);

    @Modifying
    @Query("DELETE FROM PlaylistVideo pv WHERE pv.playlist.id = :playlistId AND pv.videoId = :videoId")
    void deleteByPlaylistIdAndVideoId(@Param("playlistId") Long playlistId, @Param("videoId") String videoId);

    @Modifying
    @Query("DELETE FROM PlaylistVideo pv WHERE pv.playlist.id = :playlistId")
    void deleteByPlaylistId(@Param("playlistId") Long playlistId);

    @Query("SELECT COALESCE(MAX(pv.position), 0) FROM PlaylistVideo pv WHERE pv.playlist.id = :playlistId")
    Integer findMaxPositionByPlaylistId(@Param("playlistId") Long playlistId);
}
