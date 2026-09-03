package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.Hashtag;
import com.socialmedia.entity.SearchHistory;
import com.socialmedia.entity.User;
import com.socialmedia.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private HashtagRepository hashtagRepository;

    @Autowired
    private SearchHistoryRepository searchHistoryRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    @Transactional
    public UnifiedSearchResponse search(Long currentUserId, String query, String tab, int page, int limit) {
        if (query == null || query.trim().isEmpty()) {
            return getRecentAndTrendingSearches(currentUserId);
        }

        String q = query.trim();

        // Record search history if user is logged in
        if (currentUserId != null && !q.isEmpty()) {
            User user = userRepository.findById(currentUserId).orElse(null);
            if (user != null) {
                SearchHistory history = SearchHistory.builder()
                        .user(user)
                        .queryText(q)
                        .searchType(tab != null ? tab.toUpperCase() : "ALL")
                        .build();
                searchHistoryRepository.save(history);
            }
        }

        UnifiedSearchResponse.UnifiedSearchResponseBuilder response = UnifiedSearchResponse.builder();

        // 1. Search People
        if (tab == null || tab.equalsIgnoreCase("all") || tab.equalsIgnoreCase("people")) {
            List<UserResponse> users = userRepository.findByUsernameContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(q, q, PageRequest.of(page - 1, limit))
                    .stream()
                    .map(u -> userService.mapToUserResponse(u, currentUserId))
                    .collect(Collectors.toList());
            response.users(users);
        }

        // 2. Search Posts
        if (tab == null || tab.equalsIgnoreCase("all") || tab.equalsIgnoreCase("posts")) {
            List<PostResponse> posts = postRepository.searchPosts(q, PageRequest.of(page - 1, limit))
                    .stream()
                    .map(p -> postService.mapToPostResponse(p, currentUserId))
                    .collect(Collectors.toList());
            response.posts(posts);
        }

        // 3. Search Videos
        if (tab == null || tab.equalsIgnoreCase("all") || tab.equalsIgnoreCase("videos")) {
            List<PostResponse> videos = postRepository.searchPosts(q, PageRequest.of(page - 1, limit))
                    .stream()
                    .filter(p -> "VIDEO".equalsIgnoreCase(p.getPostType().name()))
                    .map(p -> postService.mapToPostResponse(p, currentUserId))
                    .collect(Collectors.toList());
            response.videos(videos);
        }

        // 4. Search Hashtags
        if (tab == null || tab.equalsIgnoreCase("all") || tab.equalsIgnoreCase("hashtags")) {
            List<String> tags = hashtagRepository.findByTagIgnoreCase(q.replace("#", ""))
                    .map(h -> List.of(h.getTag()))
                    .orElseGet(() -> hashtagRepository.findTrending(PageRequest.of(0, 5)).stream().map(Hashtag::getTag).collect(Collectors.toList()));
            response.hashtags(tags);
        }

        return response.build();
    }

    @Transactional(readOnly = true)
    public UnifiedSearchResponse getRecentAndTrendingSearches(Long currentUserId) {
        List<String> recent = Collections.emptyList();
        if (currentUserId != null) {
            User user = userRepository.findById(currentUserId).orElse(null);
            if (user != null) {
                recent = searchHistoryRepository.findByUserOrderByCreatedAtDesc(user, PageRequest.of(0, 8))
                        .stream().map(SearchHistory::getQueryText).distinct().collect(Collectors.toList());
            }
        }

        List<String> trending = hashtagRepository.findTrending(PageRequest.of(0, 6))
                .stream().map(Hashtag::getTag).collect(Collectors.toList());

        return UnifiedSearchResponse.builder()
                .recentSearches(recent)
                .hashtags(trending)
                .build();
    }

    @Transactional
    public void clearSearchHistory(Long currentUserId) {
        User user = userRepository.findById(currentUserId).orElseThrow(() -> new RuntimeException("User not found"));
        searchHistoryRepository.deleteByUser(user);
    }
}
