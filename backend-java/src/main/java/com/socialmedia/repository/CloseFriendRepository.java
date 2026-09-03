package com.socialmedia.repository;

import com.socialmedia.entity.CloseFriend;
import com.socialmedia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CloseFriendRepository extends JpaRepository<CloseFriend, Long> {
    List<CloseFriend> findByUserOrderByCreatedAtDesc(User user);
    Optional<CloseFriend> findByUserAndFriend(User user, User friend);
    boolean existsByUserAndFriend(User user, User friend);
    void deleteByUserAndFriend(User user, User friend);
}
