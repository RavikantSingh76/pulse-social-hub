package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.CloseFriend;
import com.socialmedia.entity.User;
import com.socialmedia.repository.CloseFriendRepository;
import com.socialmedia.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CloseFriendService {

    @Autowired
    private CloseFriendRepository closeFriendRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @Transactional
    public void addCloseFriend(Long userId, Long friendUserId) {
        if (userId.equals(friendUserId)) throw new RuntimeException("Cannot add yourself to close friends");

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        User friend = userRepository.findById(friendUserId).orElseThrow(() -> new RuntimeException("Friend user not found"));

        if (!closeFriendRepository.existsByUserAndFriend(user, friend)) {
            CloseFriend cf = CloseFriend.builder().user(user).friend(friend).build();
            closeFriendRepository.save(cf);
        }
    }

    @Transactional
    public void removeCloseFriend(Long userId, Long friendUserId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        User friend = userRepository.findById(friendUserId).orElseThrow(() -> new RuntimeException("Friend user not found"));
        closeFriendRepository.deleteByUserAndFriend(user, friend);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getCloseFriends(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return closeFriendRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(cf -> authService.mapToUserResponse(cf.getFriend(), userId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isCloseFriend(Long authorUserId, Long viewerUserId) {
        if (authorUserId == null || viewerUserId == null) return false;
        if (authorUserId.equals(viewerUserId)) return true;
        User author = userRepository.findById(authorUserId).orElse(null);
        User viewer = userRepository.findById(viewerUserId).orElse(null);
        return author != null && viewer != null && closeFriendRepository.existsByUserAndFriend(author, viewer);
    }
}
