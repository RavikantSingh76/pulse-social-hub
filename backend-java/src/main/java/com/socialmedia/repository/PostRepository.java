package com.socialmedia.repository;

import com.socialmedia.entity.Post;
import com.socialmedia.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT p FROM Post p WHERE p.user.isSuspended = false AND (p.user.id = :userId OR p.visibility = 'PUBLIC' OR (p.visibility = 'FOLLOWERS' AND p.user.id IN (SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId AND f.status = 'ACCEPTED'))) ORDER BY p.createdAt DESC")
    List<Post> findFeedForUser(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user.isSuspended = false AND p.user.id IN (SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId AND f.status = 'ACCEPTED') ORDER BY p.createdAt DESC")
    List<Post> findFollowingFeed(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user.isSuspended = false AND p.visibility = 'PUBLIC' ORDER BY (p.viewCount + SIZE(p.mediaList) * 2) DESC, p.createdAt DESC")
    List<Post> findTrendingFeed(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user.isSuspended = false AND p.visibility = 'PUBLIC' AND p.postType = 'POST' AND SIZE(p.mediaList) > 0 ORDER BY p.createdAt DESC")
    List<Post> findPhotosFeed(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user.isSuspended = false AND p.visibility = 'PUBLIC' AND p.postType = 'VIDEO' ORDER BY p.createdAt DESC")
    List<Post> findVideosFeed(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user.isSuspended = false AND p.visibility = 'PUBLIC' AND p.postType = 'VIDEO' ORDER BY p.viewCount DESC, p.createdAt DESC")
    List<Post> findReelsFeed(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user.isSuspended = false AND p.visibility = 'PUBLIC' ORDER BY p.createdAt DESC")
    List<Post> findPublicFeed(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user.isSuspended = false AND p.visibility = 'PUBLIC' ORDER BY (p.viewCount + SIZE(p.mediaList)) DESC, p.createdAt DESC")
    List<Post> findExplorePosts(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user = :user ORDER BY p.createdAt DESC")
    List<Post> findByUserOrderByCreatedAtDesc(@Param("user") User user, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user = :user AND p.postType = 'VIDEO' ORDER BY p.createdAt DESC")
    List<Post> findVideosByUser(@Param("user") User user, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN p.hashtags h WHERE LOWER(h.tag) = LOWER(:tag) AND p.user.isSuspended = false AND p.visibility = 'PUBLIC' ORDER BY p.createdAt DESC")
    List<Post> findByHashtag(@Param("tag") String tag, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.postType = 'VIDEO' AND p.user.isSuspended = false AND p.visibility = 'PUBLIC' ORDER BY p.viewCount DESC, p.createdAt DESC")
    List<Post> findTrendingVideos(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user.isSuspended = false AND p.visibility = 'PUBLIC' AND (LOWER(p.caption) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%'))) ORDER BY p.createdAt DESC")
    List<Post> searchPosts(@Param("query") String query, Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.viewCount), 0) FROM Post p WHERE p.user = :user")
    long getTotalViewsByUser(@Param("user") User user);

    long countByUserAndPostType(User user, Post.PostType postType);
    long countByPostType(Post.PostType postType);
}
