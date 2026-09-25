package com.socialmedia.repository;

import com.socialmedia.entity.Comment;
import com.socialmedia.entity.Post;
import com.socialmedia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostAndParentCommentIsNullOrderByCreatedAtAsc(Post post);
    List<Comment> findByParentCommentOrderByCreatedAtAsc(Comment parent);
    long countByPost(Post post);
    long countByPostUser(User user);
    List<Comment> findByPost(Post post);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Comment c WHERE c.post.id = :postId AND c.parentComment IS NOT NULL")
    void deleteRepliesByPostId(@org.springframework.data.repository.query.Param("postId") Long postId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Comment c WHERE c.post.id = :postId")
    void deleteByPostId(@org.springframework.data.repository.query.Param("postId") Long postId);
}
