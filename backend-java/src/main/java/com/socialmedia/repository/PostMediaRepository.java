package com.socialmedia.repository;

import com.socialmedia.entity.Post;
import com.socialmedia.entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {
    List<PostMedia> findByPostOrderByOrderIndexAsc(Post post);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM PostMedia pm WHERE pm.post.id = :postId")
    void deleteByPostId(@org.springframework.data.repository.query.Param("postId") Long postId);
}
