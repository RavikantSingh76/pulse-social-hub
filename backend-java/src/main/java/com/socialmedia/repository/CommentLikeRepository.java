package com.socialmedia.repository;

import com.socialmedia.entity.Comment;
import com.socialmedia.entity.CommentLike;
import com.socialmedia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    Optional<CommentLike> findByUserAndComment(User user, Comment comment);
    boolean existsByUserAndComment(User user, Comment comment);
    long countByComment(Comment comment);
    void deleteByUserAndComment(User user, Comment comment);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM CommentLike cl WHERE cl.comment.post.id = :postId")
    void deleteByPostId(@org.springframework.data.repository.query.Param("postId") Long postId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM CommentLike cl WHERE cl.comment.id = :commentId")
    void deleteByCommentId(@org.springframework.data.repository.query.Param("commentId") Long commentId);
}
