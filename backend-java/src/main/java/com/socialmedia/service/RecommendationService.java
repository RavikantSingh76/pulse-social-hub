package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.Post;
import com.socialmedia.entity.User;
import com.socialmedia.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    @Transactional(readOnly = true)
    public List<UserResponse> getPeopleYouMayKnow(Long currentUserId, int limit) {
        if (currentUserId == null) {
            return userService.getSuggestions(currentUserId, limit);
        }

        User currentUser = userRepository.findById(currentUserId).orElse(null);
        if (currentUser == null) return Collections.emptyList();

        // 1. Get IDs of users already followed
        List<Long> followingIds = followRepository.findByFollowerAndStatusOrderByCreatedAtDesc(currentUser, com.socialmedia.entity.Follow.Status.ACCEPTED)
                .stream().map(f -> f.getFollowing().getId()).collect(Collectors.toList());
        followingIds.add(currentUserId);

        // 2. Candidate users (not already following)
        List<User> candidates = userRepository.findAll().stream()
                .filter(u -> !followingIds.contains(u.getId()) && !Boolean.TRUE.equals(u.getIsSuspended()))
                .limit(limit * 2)
                .collect(Collectors.toList());

        return candidates.stream()
                .limit(limit)
                .map(u -> userService.mapToUserResponse(u, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getPostsYouMayLike(Long currentUserId, int page, int limit) {
        // High engagement posts filtered for the user
        List<Post> trending = postRepository.findTrendingFeed(PageRequest.of(page - 1, limit));
        return trending.stream()
                .map(p -> postService.mapToPostResponse(p, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getRecommendedVideos(Long currentUserId, int page, int limit) {
        List<Post> videos = postRepository.findTrendingVideos(PageRequest.of(page - 1, limit));
        return videos.stream()
                .map(p -> postService.mapToPostResponse(p, currentUserId))
                .collect(Collectors.toList());
    }
}
