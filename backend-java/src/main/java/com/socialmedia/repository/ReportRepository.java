package com.socialmedia.repository;

import com.socialmedia.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatusOrderByCreatedAtDesc(Report.Status status);
    long countByStatus(Report.Status status);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Report r WHERE r.reportedPost.id = :postId")
    void deleteByReportedPostId(@org.springframework.data.repository.query.Param("postId") Long postId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Report r WHERE r.reportedComment.post.id = :postId")
    void deleteByReportedCommentPostId(@org.springframework.data.repository.query.Param("postId") Long postId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Report r WHERE r.reportedComment.id = :commentId")
    void deleteByReportedCommentId(@org.springframework.data.repository.query.Param("commentId") Long commentId);
}
