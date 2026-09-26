package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.*;
import com.socialmedia.repository.*;
import com.socialmedia.websocket.WebSocketConfig.ChatWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.socialmedia.util.FileUploadSecurityUtil;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostMediaRepository postMediaRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private CommentLikeRepository commentLikeRepository;

    @Autowired
    private SavedPostRepository savedPostRepository;

    @Autowired
    private SavedCollectionRepository savedCollectionRepository;

    @Autowired
    private UserFeedbackRepository userFeedbackRepository;

    @Autowired
    private CloseFriendService closeFriendService;

    @Autowired
    private HashtagRepository hashtagRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ChatWebSocketHandler webSocketHandler;

    private static final String UPLOAD_DIR = "uploads/";

    @Transactional
    public PostResponse createPost(Long userId, String caption, String visibility, String postType, String title, List<MultipartFile> files) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Post post = Post.builder()
                .user(user)
                .caption(caption)
                .title(title)
                .visibility(visibility != null ? Post.Visibility.valueOf(visibility.toUpperCase()) : Post.Visibility.PUBLIC)
                .postType(postType != null ? Post.PostType.valueOf(postType.toUpperCase()) : Post.PostType.POST)
                .build();

        post = postRepository.save(post);

        // Process hashtags
        if (caption != null && !caption.trim().isEmpty()) {
            Set<Hashtag> hashtags = extractHashtags(caption);
            post.setHashtags(hashtags);
        }

        // Process media uploads
        if (files != null && !files.isEmpty()) {
            int order = 0;
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String fileUrl = saveFile(file);
                    String mediaType = file.getContentType() != null && file.getContentType().startsWith("video") ? "VIDEO" : "IMAGE";

                    PostMedia media = PostMedia.builder()
                            .post(post)
                            .mediaUrl(fileUrl)
                            .mediaType(PostMedia.MediaType.valueOf(mediaType))
                            .orderIndex(order++)
                            .build();

                    postMediaRepository.save(media);
                    post.getMediaList().add(media);
                }
            }
        }

        // Check for mentions and notify
        if (caption != null) {
            notifyMentionedUsers(user, caption, post.getId(), "POST");
        }

        return mapToPostResponse(post, userId);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getFeedByType(Long currentUserId, String type, int page, int limit) {
        PageRequest pageable = PageRequest.of(page - 1, limit);
        List<Post> posts;

        String feedType = type != null ? type.toUpperCase() : "FOR_YOU";

        switch (feedType) {
            case "FOLLOWING":
                posts = currentUserId != null
                        ? postRepository.findFollowingFeed(currentUserId, pageable)
                        : postRepository.findPublicFeed(pageable);
                break;
            case "TRENDING":
            case "FOR_YOU":
                posts = postRepository.findTrendingFeed(pageable);
                break;
            case "PHOTOS":
                posts = postRepository.findPhotosFeed(pageable);
                break;
            case "VIDEOS":
                posts = postRepository.findVideosFeed(pageable);
                break;
            case "REELS":
                posts = postRepository.findReelsFeed(pageable);
                break;
            case "LATEST":
            default:
                posts = currentUserId != null
                        ? postRepository.findFeedForUser(currentUserId, pageable)
                        : postRepository.findPublicFeed(pageable);
                break;
        }

        List<PostResponse> result = posts.stream()
                .filter(p -> {
                    if (currentUserId != null) {
                        User currentUser = userRepository.findById(currentUserId).orElse(null);
                        if (currentUser != null) {
                            Set<Long> notInterestedPosts = userFeedbackRepository.findNotInterestedPostIds(currentUser);
                            if (notInterestedPosts.contains(p.getId())) return false;
                        }
                    }
                    if (p.getVisibility() == Post.Visibility.CLOSE_FRIENDS) {
                        return closeFriendService.isCloseFriend(p.getUser().getId(), currentUserId);
                    }
                    return true;
                })
                .map(p -> mapToPostResponse(p, currentUserId))
                .collect(Collectors.toList());

        return result;
    }

    @Transactional
    public void recordNotInterested(Long userId, Long postId, String reason) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));

        if (!userFeedbackRepository.existsByUserAndPost(user, post)) {
            UserFeedback feedback = UserFeedback.builder()
                    .user(user)
                    .post(post)
                    .feedbackType(UserFeedback.FeedbackType.NOT_INTERESTED)
                    .build();
            userFeedbackRepository.save(feedback);
        }
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getExplore(Long currentUserId, int page, int limit) {
        List<Post> posts = postRepository.findExplorePosts(PageRequest.of(page - 1, limit));
        return posts.stream()
                .map(p -> mapToPostResponse(p, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getHashtagPosts(String tag, Long currentUserId, int page, int limit) {
        List<Post> posts = postRepository.findByHashtag(tag, PageRequest.of(page - 1, limit));
        return posts.stream()
                .map(p -> mapToPostResponse(p, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getUserPosts(String username, String tab, int page, int limit, Long currentUserId) {
        User user = userRepository.findByUsernameIgnoreCase(username).orElseThrow(() -> new RuntimeException("User not found"));
        PageRequest pageable = PageRequest.of(page - 1, limit);

        if ("videos".equalsIgnoreCase(tab)) {
            return postRepository.findVideosByUser(user, pageable).stream()
                    .map(p -> mapToPostResponse(p, currentUserId)).collect(Collectors.toList());
        } else if ("saved".equalsIgnoreCase(tab)) {
            return savedPostRepository.findByUserOrderByCreatedAtDesc(user, pageable).stream()
                    .map(sp -> mapToPostResponse(sp.getPost(), currentUserId)).collect(Collectors.toList());
        }

        return postRepository.findByUserOrderByCreatedAtDesc(user, pageable).stream()
                .map(p -> mapToPostResponse(p, currentUserId)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id, Long currentUserId) {
        Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        return mapToPostResponse(post, currentUserId);
    }

    @Transactional
    public PostResponse updatePost(Long userId, Long postId, String caption, String visibility) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this post");
        }

        if (caption != null) {
            post.setCaption(caption);
            post.setHashtags(extractHashtags(caption));
        }
        if (visibility != null) {
            post.setVisibility(Post.Visibility.valueOf(visibility.toUpperCase()));
        }

        return mapToPostResponse(postRepository.save(post), userId);
    }

    @Transactional
    public void deletePost(Long userId, Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (!post.getUser().getId().equals(userId) && user.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Unauthorized to delete this post");
        }

        // 1. Delete physical media files if stored locally
        if (post.getMediaList() != null) {
            for (PostMedia media : post.getMediaList()) {
                String mediaUrl = media.getMediaUrl();
                if (mediaUrl != null && (mediaUrl.startsWith("/uploads/") || mediaUrl.startsWith("uploads/"))) {
                    try {
                        String relativePath = mediaUrl.startsWith("/") ? mediaUrl.substring(1) : mediaUrl;
                        Path filePath = Paths.get(relativePath);
                        Files.deleteIfExists(filePath);
                    } catch (Exception ignored) {
                    }
                }
            }
        }

        // 2. Clean up notifications for post and all its comments
        List<Comment> postComments = commentRepository.findByPost(post);
        List<Long> commentIds = postComments != null && !postComments.isEmpty()
                ? postComments.stream().map(Comment::getId).collect(Collectors.toList())
                : Collections.emptyList();

        if (!commentIds.isEmpty()) {
            notificationRepository.deleteByPostAndCommentIds(postId, commentIds);
        } else {
            notificationRepository.deleteByPostId(postId);
        }

        // 3. Clean up reports (for post and comments)
        reportRepository.deleteByReportedCommentPostId(postId);
        reportRepository.deleteByReportedPostId(postId);

        // 4. Clean up comment likes & comment reactions
        commentLikeRepository.deleteByPostId(postId);
        reactionRepository.deleteByCommentPostId(postId);

        // 5. Clean up comments (child replies first, then top-level comments)
        commentRepository.deleteRepliesByPostId(postId);
        commentRepository.deleteByPostId(postId);

        // 6. Clean up post likes, reactions, saved posts, and user feedbacks
        likeRepository.deleteByPostId(postId);
        reactionRepository.deleteByPostId(postId);
        savedPostRepository.deleteByPostId(postId);
        userFeedbackRepository.deleteByPostId(postId);

        // 7. Clean up media records and hashtags
        postMediaRepository.deleteByPostId(postId);
        postRepository.deletePostHashtags(postId);

        // 8. Finally, delete the post itself directly
        postRepository.deletePostByIdDirect(postId);
    }

    @Transactional
    public Map<String, Object> toggleLike(Long userId, Long postId) {
        return toggleReaction(userId, postId, "LIKE");
    }

    @Transactional
    public Map<String, Object> toggleReaction(Long userId, Long postId, String reactionTypeStr) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));

        Reaction.ReactionType requestedType = reactionTypeStr != null
                ? Reaction.ReactionType.valueOf(reactionTypeStr.toUpperCase())
                : Reaction.ReactionType.LIKE;

        Optional<Reaction> existing = reactionRepository.findByUserAndPost(user, post);

        String currentReaction = null;
        if (existing.isPresent()) {
            Reaction r = existing.get();
            if (r.getReactionType() == requestedType) {
                // Remove reaction
                reactionRepository.delete(r);
                likeRepository.deleteByUserAndPost(user, post);
            } else {
                // Change reaction
                r.setReactionType(requestedType);
                reactionRepository.save(r);
                currentReaction = requestedType.name();
            }
        } else {
            // New reaction
            Reaction reaction = Reaction.builder()
                    .user(user)
                    .post(post)
                    .reactionType(requestedType)
                    .build();
            reactionRepository.save(reaction);
            currentReaction = requestedType.name();

            // Maintain legacy Like record
            if (!likeRepository.existsByUserAndPost(user, post)) {
                Like like = Like.builder().user(user).post(post).build();
                likeRepository.save(like);
            }

            // Send notification
            if (!post.getUser().getId().equals(userId)) {
                Notification notif = Notification.builder()
                        .recipient(post.getUser())
                        .actor(user)
                        .type(Notification.Type.LIKE)
                        .entityType("POST")
                        .entityId(post.getId())
                        .message("reacted " + requestedType.name() + " to your post")
                        .build();
                notificationRepository.save(notif);
                webSocketHandler.sendNotificationToUser(post.getUser().getId(), notif.getMessage());
            }
        }

        long totalCount = reactionRepository.countByPost(post);
        Map<String, Long> groupedCounts = getReactionsCountMap(post);

        return Map.of(
                "is_liked", currentReaction != null,
                "current_reaction", currentReaction != null ? currentReaction : "",
                "likes_count", totalCount,
                "reaction_counts", groupedCounts
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPostReactionsSummary(Long userId, Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        String currentReaction = null;
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                Optional<Reaction> existing = reactionRepository.findByUserAndPost(user, post);
                if (existing.isPresent()) {
                    currentReaction = existing.get().getReactionType().name();
                }
            }
        }
        long totalCount = reactionRepository.countByPost(post);
        Map<String, Long> groupedCounts = getReactionsCountMap(post);
        return Map.of(
                "is_liked", currentReaction != null,
                "current_reaction", currentReaction != null ? currentReaction : "",
                "likes_count", totalCount,
                "reaction_counts", groupedCounts
        );
    }

    @Transactional
    public Map<String, Object> toggleSave(Long userId, Long postId) {
        return savePostToCollection(userId, postId, null);
    }

    @Transactional
    public Map<String, Object> savePostToCollection(Long userId, Long postId, Long collectionId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));

        Optional<SavedPost> existing = savedPostRepository.findByUserAndPost(user, post);
        SavedCollection collection = collectionId != null ? savedCollectionRepository.findById(collectionId).orElse(null) : null;

        boolean isSaved;
        if (existing.isPresent()) {
            SavedPost sp = existing.get();
            if (collection != null && (sp.getCollection() == null || !sp.getCollection().getId().equals(collectionId))) {
                sp.setCollection(collection);
                savedPostRepository.save(sp);
                isSaved = true;
            } else {
                savedPostRepository.delete(sp);
                isSaved = false;
            }
        } else {
            SavedPost savedPost = SavedPost.builder()
                    .user(user)
                    .post(post)
                    .collection(collection)
                    .build();
            savedPostRepository.save(savedPost);
            isSaved = true;
        }

        return Map.of("is_saved", isSaved, "collection_id", collection != null ? collection.getId() : 0);
    }

    // Collections Management
    @Transactional
    public SavedCollectionResponse createCollection(Long userId, CreateCollectionRequest req) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        SavedCollection collection = SavedCollection.builder()
                .user(user)
                .name(req.getName())
                .coverUrl(req.getCoverUrl())
                .build();
        collection = savedCollectionRepository.save(collection);
        return mapToCollectionResponse(collection);
    }

    @Transactional(readOnly = true)
    public List<SavedCollectionResponse> getUserCollections(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return savedCollectionRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::mapToCollectionResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteCollection(Long userId, Long collectionId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        SavedCollection collection = savedCollectionRepository.findByIdAndUser(collectionId, user)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        savedCollectionRepository.delete(collection);
    }

    @Transactional
    public void reportPost(Long userId, Long postId, ReportRequest request) {
        User reporter = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));

        Report report = Report.builder()
                .reporter(reporter)
                .reportedPost(post)
                .reason(request.getReason() != null ? request.getReason() : "SPAM")
                .details(request.getDetails())
                .status(Report.Status.PENDING)
                .build();

        reportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getTrendingVideos(Long currentUserId, int page, int limit) {
        List<Post> videos = postRepository.findTrendingVideos(PageRequest.of(page - 1, limit));
        return videos.stream()
                .map(p -> mapToPostResponse(p, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public void incrementViewCount(Long postId) {
        postRepository.findById(postId).ifPresent(p -> {
            p.setViewCount(p.getViewCount() + 1);
            postRepository.save(p);
        });
    }

    public PostResponse mapToPostResponse(Post post, Long currentUserId) {
        List<MediaItem> media = post.getMediaList().stream()
                .map(m -> MediaItem.builder().url(m.getMediaUrl()).type(m.getMediaType().name()).build())
                .collect(Collectors.toList());

        List<String> hashtags = post.getHashtags().stream()
                .map(Hashtag::getTag)
                .collect(Collectors.toList());

        boolean isLiked = false;
        String currentReaction = null;
        boolean isSaved = false;
        Long savedCollectionId = null;

        if (currentUserId != null) {
            User currentUser = userRepository.findById(currentUserId).orElse(null);
            if (currentUser != null) {
                Optional<Reaction> reaction = reactionRepository.findByUserAndPost(currentUser, post);
                if (reaction.isPresent()) {
                    isLiked = true;
                    currentReaction = reaction.get().getReactionType().name();
                }
                Optional<SavedPost> savedPost = savedPostRepository.findByUserAndPost(currentUser, post);
                if (savedPost.isPresent()) {
                    isSaved = true;
                    if (savedPost.get().getCollection() != null) {
                        savedCollectionId = savedPost.get().getCollection().getId();
                    }
                }
            }
        }

        Map<String, Long> reactionsMap = getReactionsCountMap(post);
        long totalLikes = reactionRepository.countByPost(post);
        long totalComments = commentRepository.countByPost(post);

        return PostResponse.builder()
                .id(post.getId())
                .userId(post.getUser().getId())
                .username(post.getUser().getUsername())
                .displayName(post.getUser().getDisplayName())
                .avatarUrl(post.getUser().getAvatarUrl())
                .isVerified(Boolean.TRUE.equals(post.getUser().getIsVerified()))
                .caption(post.getCaption())
                .visibility(post.getVisibility().name())
                .postType(post.getPostType().name())
                .title(post.getTitle())
                .viewCount(post.getViewCount())
                .likesCount(totalLikes)
                .commentsCount(totalComments)
                .isLiked(isLiked)
                .currentReaction(currentReaction)
                .reactionsCount(reactionsMap)
                .isSaved(isSaved)
                .savedCollectionId(savedCollectionId)
                .media(media)
                .hashtags(hashtags)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private Map<String, Long> getReactionsCountMap(Post post) {
        Map<String, Long> map = new HashMap<>();
        List<Object[]> grouped = reactionRepository.countReactionsByPostGrouped(post);
        for (Object[] row : grouped) {
            Reaction.ReactionType type = (Reaction.ReactionType) row[0];
            Long cnt = (Long) row[1];
            map.put(type.name(), cnt);
        }
        return map;
    }

    private SavedCollectionResponse mapToCollectionResponse(SavedCollection c) {
        return SavedCollectionResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .coverUrl(c.getCoverUrl())
                .postCount((long) c.getSavedPosts().size())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private Set<Hashtag> extractHashtags(String text) {
        Set<Hashtag> hashtags = new HashSet<>();
        Pattern pattern = Pattern.compile("#(\\w+)");
        Matcher matcher = pattern.matcher(text);

        while (matcher.find()) {
            String tag = matcher.group(1).toLowerCase();
            Hashtag hashtag = hashtagRepository.findByTagIgnoreCase(tag)
                    .orElseGet(() -> hashtagRepository.save(Hashtag.builder().tag(tag).build()));
            hashtags.add(hashtag);
        }
        return hashtags;
    }

    private void notifyMentionedUsers(User actor, String text, Long entityId, String entityType) {
        Pattern pattern = Pattern.compile("@(\\w+)");
        Matcher matcher = pattern.matcher(text);

        while (matcher.find()) {
            String username = matcher.group(1);
            userRepository.findByUsernameIgnoreCase(username).ifPresent(mentioned -> {
                if (!mentioned.getId().equals(actor.getId())) {
                    Notification notif = Notification.builder()
                            .recipient(mentioned)
                            .actor(actor)
                            .type(Notification.Type.MENTION)
                            .entityType(entityType)
                            .entityId(entityId)
                            .message("mentioned you in a " + entityType.toLowerCase())
                            .build();
                    notificationRepository.save(notif);
                    webSocketHandler.sendNotificationToUser(mentioned.getId(), notif.getMessage());
                }
            });
        }
    }

    private String saveFile(MultipartFile file) {
        try {
            return FileUploadSecurityUtil.storeMedia(file, UPLOAD_DIR);
        } catch (Exception e) {
            throw new RuntimeException("Failed to store media file: " + e.getMessage());
        }
    }
}
