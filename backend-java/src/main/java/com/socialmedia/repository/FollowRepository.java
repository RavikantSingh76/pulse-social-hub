package com.socialmedia.repository;

import com.socialmedia.entity.Follow;
import com.socialmedia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    Optional<Follow> findByFollowerAndFollowing(User follower, User following);
    boolean existsByFollowerAndFollowingAndStatus(User follower, User following, Follow.Status status);
    long countByFollowingAndStatus(User following, Follow.Status status);
    long countByFollowerAndStatus(User follower, Follow.Status status);
    void deleteByFollowerAndFollowing(User follower, User following);
    List<Follow> findByFollowingAndStatusOrderByCreatedAtDesc(User following, Follow.Status status);
    List<Follow> findByFollowerAndStatusOrderByCreatedAtDesc(User follower, Follow.Status status);
}
