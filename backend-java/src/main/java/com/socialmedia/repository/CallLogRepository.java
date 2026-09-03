package com.socialmedia.repository;

import com.socialmedia.entity.CallLog;
import com.socialmedia.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CallLogRepository extends JpaRepository<CallLog, Long> {
    @Query("SELECT c FROM CallLog c WHERE c.caller = :user OR c.receiver = :user ORDER BY c.createdAt DESC")
    List<CallLog> findUserCallHistory(@Param("user") User user, Pageable pageable);
}
