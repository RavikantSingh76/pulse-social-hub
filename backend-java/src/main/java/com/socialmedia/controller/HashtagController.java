package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.Hashtag;
import com.socialmedia.entity.HashtagFollow;
import com.socialmedia.entity.User;
import com.socialmedia.repository.HashtagFollowRepository;
import com.socialmedia.repository.HashtagRepository;
import com.socialmedia.repository.PostRepository;
import com.socialmedia.repository.UserRepository;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hashtags")
public class HashtagController {

    @Autowired
    private HashtagRepository hashtagRepository;

    @Autowired
    private HashtagFollowRepository hashtagFollowRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{tag}")
    public ResponseEntity<ApiResponse<HashtagDetailResponse>> getHashtagDetail(
            @PathVariable String tag,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        String cleanTag = tag.startsWith("#") ? tag.substring(1) : tag;
        Hashtag hashtag = hashtagRepository.findByTagIgnoreCase(cleanTag).orElse(null);

        long postCount = postRepository.findByHashtag(cleanTag, PageRequest.of(0, 100)).size();
        long followerCount = hashtag != null ? hashtagFollowRepository.countByHashtag(hashtag) : 0;
        boolean isFollowed = false;

        if (userPrincipal != null && hashtag != null) {
            User user = userRepository.findById(userPrincipal.getId()).orElse(null);
            if (user != null) {
                isFollowed = hashtagFollowRepository.existsByUserAndHashtag(user, hashtag);
            }
        }

        HashtagDetailResponse res = HashtagDetailResponse.builder()
                .id(hashtag != null ? hashtag.getId() : null)
                .tag(cleanTag)
                .postCount(postCount)
                .followersCount(followerCount)
                .isFollowed(isFollowed)
                .build();

        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PostMapping("/{tag}/follow")
    public ResponseEntity<ApiResponse<String>> followHashtag(
            @PathVariable String tag,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        String cleanTag = tag.startsWith("#") ? tag.substring(1) : tag;
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow(() -> new RuntimeException("User not found"));
        Hashtag hashtag = hashtagRepository.findByTagIgnoreCase(cleanTag)
                .orElseGet(() -> hashtagRepository.save(Hashtag.builder().tag(cleanTag).build()));

        if (!hashtagFollowRepository.existsByUserAndHashtag(user, hashtag)) {
            HashtagFollow hf = HashtagFollow.builder().user(user).hashtag(hashtag).build();
            hashtagFollowRepository.save(hf);
        }

        return ResponseEntity.ok(ApiResponse.success("Following #" + cleanTag, "OK"));
    }

    @DeleteMapping("/{tag}/follow")
    public ResponseEntity<ApiResponse<String>> unfollowHashtag(
            @PathVariable String tag,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        String cleanTag = tag.startsWith("#") ? tag.substring(1) : tag;
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow(() -> new RuntimeException("User not found"));
        hashtagRepository.findByTagIgnoreCase(cleanTag).ifPresent(hashtag -> hashtagFollowRepository.deleteByUserAndHashtag(user, hashtag));

        return ResponseEntity.ok(ApiResponse.success("Unfollowed #" + cleanTag, "OK"));
    }
}
