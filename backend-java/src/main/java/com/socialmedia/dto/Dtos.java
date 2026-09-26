package com.socialmedia.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class Dtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public static <T> ApiResponse<T> success(T data) {
            return ApiResponse.<T>builder().success(true).data(data).build();
        }

        public static <T> ApiResponse<T> success(String message, T data) {
            return ApiResponse.<T>builder().success(true).message(message).data(data).build();
        }

        public static <T> ApiResponse<T> error(String message) {
            return ApiResponse.<T>builder().success(false).message(message).build();
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        private String identifier;
        private String password;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        private String username;
        private String email;
        private String password;
        private String displayName;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ResetPasswordRequest {
        private String email;
        private String otp;
        private String newPassword;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthResponse {
        private String token;
        private UserResponse user;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserResponse {
        private Long id;
        private String username;
        private String email;
        private String displayName;
        private String avatarUrl;
        private String coverUrl;
        private String bio;
        private String website;
        private String location;
        private String socialLinks;
        private String role;
        private Boolean isPrivate;
        private Boolean isVerified;
        private Boolean isSuspended;
        private Boolean isCloseFriend;
        private Boolean showOnlineStatus;
        private String allowMessagesFrom;
        private LocalDateTime lastSeenAt;
        private LocalDateTime createdAt;
        private Long followersCount;
        private Long followingCount;
        private Long postsCount;
        private Long unreadNotificationsCount;
        private Long unreadMessagesCount;
        private String followStatus; // NONE, ACCEPTED, PENDING
        private Boolean isFollower;
        private Boolean isSelf;
        private Boolean isOnline;
        private Long mutualFollowersCount;
        private List<String> mutualFollowerUsernames;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateProfileRequest {
        private String displayName;
        private String bio;
        private String website;
        private String location;
        private String socialLinks;
        private Boolean isPrivate;
        private String avatarUrl;
        private String coverUrl;
        private Boolean showOnlineStatus;
        private String allowMessagesFrom;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreatePostRequest {
        private String caption;
        private String visibility; // PUBLIC, FOLLOWERS, CLOSE_FRIENDS, PRIVATE
        private String postType;   // POST, VIDEO
        private String title;
        private List<MediaItem> mediaItems;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MediaItem {
        private String url;
        private String type; // IMAGE, VIDEO
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PostResponse {
        private Long id;
        private Long userId;
        private String username;
        private String displayName;
        private String avatarUrl;
        private Boolean isVerified;
        private String caption;
        private String visibility;
        private String postType;
        private String title;
        private Long viewCount;
        private Long likesCount;
        private Long commentsCount;
        private Boolean isLiked;
        private String currentReaction; // LIKE, LOVE, HAHA, WOW, SAD, ANGRY or null
        private Map<String, Long> reactionsCount;
        private Boolean isSaved;
        private Long savedCollectionId;
        private List<MediaItem> media;
        private List<String> hashtags;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ReactionRequest {
        private String reactionType; // LIKE, LOVE, HAHA, WOW, SAD, ANGRY
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ReactionResponse {
        private Long id;
        private Long userId;
        private String username;
        private String reactionType;
        private Map<String, Long> reactionCounts;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateCommentRequest {
        private String content;
        private Long parentId;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CommentResponse {
        private Long id;
        private Long postId;
        private Long userId;
        private String username;
        private String displayName;
        private String avatarUrl;
        private Boolean isVerified;
        private Long parentId;
        private String content;
        private Long likesCount;
        private Boolean isLiked;
        private String currentReaction;
        private List<CommentResponse> replies;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StoryResponse {
        private Long id;
        private Long userId;
        private String username;
        private String displayName;
        private String avatarUrl;
        private Boolean isVerified;
        private String mediaUrl;
        private String mediaType; // IMAGE, VIDEO, TEXT
        private String audience;  // PUBLIC, FOLLOWERS, CLOSE_FRIENDS
        private String caption;
        private String bgGradient;
        private String fontFamily;
        private String textColor;
        private Long viewsCount;
        private Boolean isViewed;
        private LocalDateTime expiresAt;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateTextStoryRequest {
        private String text;
        private String bgGradient;
        private String fontFamily;
        private String textColor;
        private String audience; // PUBLIC, FOLLOWERS, CLOSE_FRIENDS
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StoryHighlightResponse {
        private Long id;
        private Long userId;
        private String title;
        private String coverUrl;
        private List<StoryHighlightItemResponse> items;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StoryHighlightItemResponse {
        private Long id;
        private String mediaUrl;
        private String mediaType;
        private String caption;
        private String bgGradient;
        private Integer orderIndex;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateHighlightRequest {
        private String title;
        private String coverUrl;
        private List<Long> storyIds;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SavedCollectionResponse {
        private Long id;
        private String name;
        private String coverUrl;
        private Long postCount;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateCollectionRequest {
        private String name;
        private String coverUrl;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MessageResponse {
        private Long id;
        private Long conversationId;
        private Long senderId;
        private String senderUsername;
        private String senderDisplayName;
        private String senderAvatarUrl;
        private String messageText;
        private String mediaUrl;
        private String mediaType;
        private Boolean isForwarded;
        private Boolean isDeletedForEveryone;
        private Boolean isRead;
        private MessageQuoteResponse replyTo;
        private Map<String, Long> reactions;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MessageQuoteResponse {
        private Long id;
        private Long senderId;
        private String senderUsername;
        private String messageText;
        private String mediaUrl;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ConversationResponse {
        private Long id;
        private Boolean isGroup;
        private String groupName;
        private String groupAvatarUrl;
        private UserResponse otherUser;
        private List<UserResponse> members;
        private MessageResponse lastMessage;
        private Long unreadCount;
        private LocalDateTime updatedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SendMessageRequest {
        private Long recipientId;
        private Long conversationId;
        private String messageText;
        private String mediaUrl;
        private Long replyToMessageId;
        private Boolean isForwarded;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateGroupRequest {
        private String groupName;
        private String groupAvatarUrl;
        private List<Long> memberIds;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class NotificationResponse {
        private Long id;
        private UserResponse actor;
        private String type; // LIKE, REACTION, COMMENT, REPLY, FOLLOW, FOLLOW_ACCEPT, MENTION, MESSAGE, SYSTEM
        private Long entityId;
        private String entityType;
        private String message;
        private Boolean isRead;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class GroupedNotificationResponse {
        private String groupKey;
        private String type;
        private String entityType;
        private Long entityId;
        private UserResponse primaryActor;
        private List<UserResponse> actors;
        private long totalCount;
        private String formattedMessage;
        private String previewMediaUrl;
        private Boolean isRead;
        private LocalDateTime latestTimestamp;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UnifiedSearchResponse {
        private List<UserResponse> users;
        private List<PostResponse> posts;
        private List<PostResponse> videos;
        private List<String> hashtags;
        private List<String> recentSearches;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreatorAnalyticsResponse {
        private long totalProfileViews;
        private long totalPostViews;
        private long totalLikes;
        private long totalComments;
        private long totalFollowers;
        private double engagementRate;
        private List<Map<String, Object>> weeklyActivity;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreatorStudioOverviewResponse {
        private long totalFollowers;
        private long followersGrowthThisMonth;
        private long totalPosts;
        private long totalVideos;
        private long totalReels;
        private long totalStories;
        private long totalViews;
        private long totalLikes;
        private long totalComments;
        private long totalShares;
        private long totalSaves;
        private double engagementRate;
        private List<PostResponse> topPerformingContent;
        private List<Map<String, Object>> reachChart;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AdminStatsResponse {
        private long totalUsers;
        private long activeUsers;
        private long totalPosts;
        private long totalVideos;
        private long totalReports;
        private long pendingReports;
        private long totalConversations;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ReportRequest {
        private Long reportedUserId;
        private Long reportedPostId;
        private Long reportedCommentId;
        private String reason;
        private String details;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserActivityResponse {
        private List<PostResponse> posts;
        private List<CommentResponse> comments;
        private List<PostResponse> likedPosts;
        private List<SavedCollectionResponse> collections;
        private List<StoryResponse> archivedStories;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CloseFriendResponse {
        private Long id;
        private UserResponse friend;
        private LocalDateTime addedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class NotificationPreferenceResponse {
        private Boolean notifyLikes;
        private Boolean notifyComments;
        private Boolean notifyFollowers;
        private Boolean notifyMessages;
        private Boolean notifyMentions;
        private Boolean notifyStories;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateNotificationPreferenceRequest {
        private Boolean notifyLikes;
        private Boolean notifyComments;
        private Boolean notifyFollowers;
        private Boolean notifyMessages;
        private Boolean notifyMentions;
        private Boolean notifyStories;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class HashtagDetailResponse {
        private Long id;
        private String tag;
        private long postCount;
        private long followersCount;
        private boolean isFollowed;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ShortVideoResponse {
        private String videoId;
        private String status;
        private Double duration;
        private Long fileSize;
        private String fileUrl;
        private String mimeType;
        private Long userId;
        private String username;
        private String failureReason;
        private String createdAt;
        private String updatedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AudioTrackResponse {
        private Long id;
        private String title;
        private String artist;
        private String audioUrl;
        private String coverUrl;
        private Double duration;
        private String sourceType;
        private String licenseType;
        private String copyrightOwner;
        private Long usageCount;
        private String genre;
        private Long createdById;
        private String createdByName;
        private String createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateAudioTrackRequest {
        private String title;
        private String artist;
        private String audioUrl;
        private String coverUrl;
        private Double duration;
        private String sourceType;
        private String licenseType;
        private String copyrightOwner;
        private String genre;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ReelResponse {
        private Long id;
        private String videoUrl;
        private String thumbnailUrl;
        private String caption;
        private Double duration;
        private AudioTrackResponse music;
        private Double audioStartTime;
        private Double audioEndTime;
        private Integer originalAudioVolume;
        private Integer musicVolume;
        private Long views;
        private Long likesCount;
        private Long commentsCount;
        private Long sharesCount;
        private Boolean isLiked;
        private Boolean isSaved;
        private String status;
        private String failureReason;
        private UserResponse user;
        private String createdAt;
        private String updatedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateReelRequest {
        private String caption;
        private Long musicId;
        private Double audioStartTime;
        private Double audioEndTime;
        private Integer originalAudioVolume;
        private Integer musicVolume;
        private String thumbnailUrl;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateReelRequest {
        private String caption;
        private String thumbnailUrl;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ReelFeedResponse {
        private List<ReelResponse> reels;
        private int page;
        private int limit;
        private long total;
        private boolean hasMore;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreatePlaylistRequest {
        private String name;
        private String description;
        private String coverUrl;
        private String visibility; // PUBLIC, PRIVATE
        private List<String> videoIds;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdatePlaylistRequest {
        private String name;
        private String description;
        private String coverUrl;
        private String visibility;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AddPlaylistVideosRequest {
        private String videoId;
        private List<String> videoIds;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ReorderPlaylistVideosRequest {
        private List<String> videoIds;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PlaylistVideoResponse {
        private Long id;
        private Long playlistId;
        private String videoId;
        private Integer position;
        private String addedAt;
        private String videoUrl;
        private String thumbnailUrl;
        private String caption;
        private Double duration;
        private Long views;
        private Long likesCount;
        private Long commentsCount;
        private Long sharesCount;
        private UserResponse user;
        private AudioTrackResponse music;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PlaylistResponse {
        private Long id;
        private Long userId;
        private String name;
        private String description;
        private String coverUrl;
        private String visibility;
        private int videoCount;
        private List<PlaylistVideoResponse> videos;
        private UserResponse user;
        private String createdAt;
        private String updatedAt;
    }
}

