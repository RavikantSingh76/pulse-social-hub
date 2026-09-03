package com.socialmedia.repository;

import com.socialmedia.entity.Post;
import com.socialmedia.entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {
    List<PostMedia> findByPostOrderByOrderIndexAsc(Post post);
}
