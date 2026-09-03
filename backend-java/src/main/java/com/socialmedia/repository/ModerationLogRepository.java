package com.socialmedia.repository;

import com.socialmedia.entity.ModerationLog;
import com.socialmedia.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModerationLogRepository extends JpaRepository<ModerationLog, Long> {
    List<ModerationLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<ModerationLog> findByTargetUserOrderByCreatedAtDesc(User targetUser);
}
