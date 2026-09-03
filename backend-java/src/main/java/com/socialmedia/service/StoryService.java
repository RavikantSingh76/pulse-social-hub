package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.*;
import com.socialmedia.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StoryService {

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private StoryViewRepository storyViewRepository;

    @Autowired
    private StoryHighlightRepository highlightRepository;

    @Autowired
    private StoryHighlightItemRepository highlightItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageService messageService;

    @Autowired
    private CloseFriendService closeFriendService;

    private static final String UPLOAD_DIR = "uploads/";

    @Transactional
    public StoryResponse createStory(Long userId, MultipartFile file, String caption, String audienceStr) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Media file is required for story");
        }

        String mediaUrl = saveFile(file);
        String mediaType = file.getContentType() != null && file.getContentType().startsWith("video") ? "VIDEO" : "IMAGE";
        Story.Audience audience = Story.Audience.PUBLIC;
        if (audienceStr != null) {
            try { audience = Story.Audience.valueOf(audienceStr.toUpperCase()); } catch (Exception ignored) {}
        }

        Story story = Story.builder()
                .user(user)
                .mediaUrl(mediaUrl)
                .mediaType(Story.MediaType.valueOf(mediaType))
                .audience(audience)
                .caption(caption)
                .build();

        story = storyRepository.save(story);
        return mapToStoryResponse(story, userId);
    }

    @Transactional
    public StoryResponse createTextStory(Long userId, CreateTextStoryRequest req) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Story.Audience audience = Story.Audience.PUBLIC;
        if (req.getAudience() != null) {
            try { audience = Story.Audience.valueOf(req.getAudience().toUpperCase()); } catch (Exception ignored) {}
        }

        Story story = Story.builder()
                .user(user)
                .mediaType(Story.MediaType.TEXT)
                .audience(audience)
                .caption(req.getText())
                .bgGradient(req.getBgGradient() != null ? req.getBgGradient() : "from-purple-600 to-pink-500")
                .fontFamily(req.getFontFamily() != null ? req.getFontFamily() : "sans")
                .textColor(req.getTextColor() != null ? req.getTextColor() : "#ffffff")
                .build();

        story = storyRepository.save(story);
        return mapToStoryResponse(story, userId);
    }

    @Transactional(readOnly = true)
    public List<StoryResponse> getActiveStories(Long currentUserId) {
        List<Story> stories = storyRepository.findByExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime.now());
        return stories.stream()
                .filter(s -> {
                    if (s.getAudience() == Story.Audience.CLOSE_FRIENDS) {
                        return closeFriendService.isCloseFriend(s.getUser().getId(), currentUserId);
                    }
                    return true;
                })
                .map(s -> mapToStoryResponse(s, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public void recordView(Long storyId, Long currentUserId) {
        if (currentUserId == null) return;
        Story story = storyRepository.findById(storyId).orElse(null);
        User user = userRepository.findById(currentUserId).orElse(null);

        if (story != null && user != null) {
            if (!storyViewRepository.existsByStoryAndUser(story, user)) {
                StoryView view = StoryView.builder().story(story).user(user).build();
                storyViewRepository.save(view);
            }
        }
    }

    @Transactional
    public void deleteStory(Long userId, Long storyId) {
        Story story = storyRepository.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (!story.getUser().getId().equals(userId) && user.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Unauthorized to delete this story");
        }
        storyRepository.delete(story);
    }

    @Transactional
    public void reactToStory(Long userId, Long storyId, String emoji) {
        Story story = storyRepository.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found"));
        // Forward story reaction to creator via direct message
        if (!story.getUser().getId().equals(userId)) {
            messageService.sendMessage(userId, SendMessageRequest.builder()
                    .recipientId(story.getUser().getId())
                    .messageText("Reacted " + emoji + " to your story")
                    .build());
        }
    }

    @Transactional
    public void replyToStory(Long userId, Long storyId, String replyText) {
        Story story = storyRepository.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found"));
        if (!story.getUser().getId().equals(userId)) {
            messageService.sendMessage(userId, SendMessageRequest.builder()
                    .recipientId(story.getUser().getId())
                    .messageText("Replied to your story: \"" + replyText + "\"")
                    .mediaUrl(story.getMediaUrl())
                    .build());
        }
    }

    // Story Highlights
    @Transactional
    public StoryHighlightResponse createHighlight(Long userId, CreateHighlightRequest req) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        StoryHighlight highlight = StoryHighlight.builder()
                .user(user)
                .title(req.getTitle() != null ? req.getTitle() : "Highlight")
                .coverUrl(req.getCoverUrl())
                .build();

        highlight = highlightRepository.save(highlight);

        if (req.getStoryIds() != null) {
            int order = 0;
            for (Long storyId : req.getStoryIds()) {
                Story s = storyRepository.findById(storyId).orElse(null);
                if (s != null) {
                    StoryHighlightItem item = StoryHighlightItem.builder()
                            .highlight(highlight)
                            .mediaUrl(s.getMediaUrl() != null ? s.getMediaUrl() : "")
                            .mediaType(s.getMediaType().name())
                            .caption(s.getCaption())
                            .bgGradient(s.getBgGradient())
                            .orderIndex(order++)
                            .build();
                    highlightItemRepository.save(item);
                    highlight.getItems().add(item);
                }
            }
        }

        return mapToHighlightResponse(highlight);
    }

    @Transactional(readOnly = true)
    public List<StoryHighlightResponse> getUserHighlights(String username) {
        User user = userRepository.findByUsernameIgnoreCase(username).orElseThrow(() -> new RuntimeException("User not found"));
        return highlightRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToHighlightResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteHighlight(Long userId, Long highlightId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        StoryHighlight highlight = highlightRepository.findById(highlightId).orElseThrow(() -> new RuntimeException("Highlight not found"));
        if (!highlight.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        highlightRepository.delete(highlight);
    }

    public StoryResponse mapToStoryResponse(Story story, Long currentUserId) {
        boolean isViewed = false;
        if (currentUserId != null) {
            User currentUser = userRepository.findById(currentUserId).orElse(null);
            if (currentUser != null) {
                isViewed = storyViewRepository.existsByStoryAndUser(story, currentUser);
            }
        }

        return StoryResponse.builder()
                .id(story.getId())
                .userId(story.getUser().getId())
                .username(story.getUser().getUsername())
                .displayName(story.getUser().getDisplayName())
                .avatarUrl(story.getUser().getAvatarUrl())
                .isVerified(Boolean.TRUE.equals(story.getUser().getIsVerified()))
                .mediaUrl(story.getMediaUrl())
                .mediaType(story.getMediaType().name())
                .audience(story.getAudience() != null ? story.getAudience().name() : "PUBLIC")
                .caption(story.getCaption())
                .bgGradient(story.getBgGradient())
                .fontFamily(story.getFontFamily())
                .textColor(story.getTextColor())
                .viewsCount((long) story.getViews().size())
                .isViewed(isViewed)
                .expiresAt(story.getExpiresAt())
                .createdAt(story.getCreatedAt())
                .build();
    }

    private StoryHighlightResponse mapToHighlightResponse(StoryHighlight h) {
        List<StoryHighlightItemResponse> items = h.getItems().stream().map(i -> StoryHighlightItemResponse.builder()
                .id(i.getId())
                .mediaUrl(i.getMediaUrl())
                .mediaType(i.getMediaType())
                .caption(i.getCaption())
                .bgGradient(i.getBgGradient())
                .orderIndex(i.getOrderIndex())
                .build()).collect(Collectors.toList());

        return StoryHighlightResponse.builder()
                .id(h.getId())
                .userId(h.getUser().getId())
                .title(h.getTitle())
                .coverUrl(h.getCoverUrl() != null && !h.getCoverUrl().isEmpty() ? h.getCoverUrl() : (!items.isEmpty() ? items.get(0).getMediaUrl() : ""))
                .items(items)
                .createdAt(h.getCreatedAt())
                .build();
    }

    private String saveFile(MultipartFile file) {
        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) dir.mkdirs();

            String ext = file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")
                    ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."))
                    : ".jpg";
            String filename = UUID.randomUUID() + ext;
            Path path = Paths.get(UPLOAD_DIR + filename);
            Files.write(path, file.getBytes());
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store media file: " + e.getMessage());
        }
    }
}
