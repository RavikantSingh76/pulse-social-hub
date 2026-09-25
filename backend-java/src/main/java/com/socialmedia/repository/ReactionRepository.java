package com.socialmedia.repository;

import com.socialmedia.entity.Comment;
import com.socialmedia.entity.Message;
import com.socialmedia.entity.Post;
import com.socialmedia.entity.Reaction;
import com.socialmedia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    Optional<Reaction> findByUserAndPost(User user, Post post);
    Optional<Reaction> findByUserAndComment(User user, Comment comment);
    Optional<Reaction> findByUserAndMessage(User user, Message message);

    List<Reaction> findByPost(Post post);
    List<Reaction> findByComment(Comment comment);
    List<Reaction> findByMessage(Message message);

    long countByPost(Post post);
    long countByPostAndReactionType(Post post, Reaction.ReactionType reactionType);

    @Query("SELECT r.reactionType, COUNT(r) FROM Reaction r WHERE r.post = :post GROUP BY r.reactionType")
    List<Object[]> countReactionsByPostGrouped(@Param("post") Post post);

    void deleteByUserAndPost(User user, Post post);
    void deleteByUserAndComment(User user, Comment comment);
    void deleteByUserAndMessage(User user, Message message);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Reaction r WHERE r.post.id = :postId")
    void deleteByPostId(@Param("postId") Long postId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Reaction r WHERE r.comment.post.id = :postId")
    void deleteByCommentPostId(@Param("postId") Long postId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Reaction r WHERE r.comment.id = :commentId")
    void deleteByCommentId(@Param("commentId") Long commentId);
}
