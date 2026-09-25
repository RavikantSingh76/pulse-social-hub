package com.socialmedia.repository;

import com.socialmedia.entity.Playlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    List<Playlist> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Playlist> findByVisibilityOrderByCreatedAtDesc(Playlist.Visibility visibility, Pageable pageable);

    @Query("SELECT p FROM Playlist p WHERE p.visibility = 'PUBLIC' OR p.user.id = :userId ORDER BY p.createdAt DESC")
    Page<Playlist> findAccessiblePlaylists(@Param("userId") Long userId, Pageable pageable);

    long countByUserId(Long userId);
}
