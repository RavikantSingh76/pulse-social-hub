package com.socialmedia.repository;

import com.socialmedia.entity.Post;
import com.socialmedia.entity.User;
import com.socialmedia.entity.UserFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface UserFeedbackRepository extends JpaRepository<UserFeedback, Long> {
    List<UserFeedback> findByUser(User user);
    boolean existsByUserAndPost(User user, Post post);

    @Query("SELECT uf.post.id FROM UserFeedback uf WHERE uf.user = :user AND uf.feedbackType = 'NOT_INTERESTED'")
    Set<Long> findNotInterestedPostIds(@Param("user") User user);

    @Query("SELECT uf.post.user.id FROM UserFeedback uf WHERE uf.user = :user AND uf.feedbackType = 'NOT_INTERESTED'")
    Set<Long> findNotInterestedAuthorIds(@Param("user") User user);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM UserFeedback uf WHERE uf.post.id = :postId")
    void deleteByPostId(@Param("postId") Long postId);
}
