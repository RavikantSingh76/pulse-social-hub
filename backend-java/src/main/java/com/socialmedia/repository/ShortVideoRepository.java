package com.socialmedia.repository;

import com.socialmedia.entity.ShortVideo;
import com.socialmedia.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShortVideoRepository extends JpaRepository<ShortVideo, Long> {

    Optional<ShortVideo> findByVideoId(String videoId);

    Optional<ShortVideo> findByChecksumSha256AndUser(String checksumSha256, User user);

    Page<ShortVideo> findByUser(User user, Pageable pageable);

    Page<ShortVideo> findByStatus(ShortVideo.VideoStatus status, Pageable pageable);

    void deleteByVideoId(String videoId);

    boolean existsByVideoId(String videoId);
}
