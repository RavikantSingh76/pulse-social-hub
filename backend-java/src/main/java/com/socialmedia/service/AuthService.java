package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.*;
import com.socialmedia.repository.*;
import com.socialmedia.security.JwtTokenProvider;
import com.socialmedia.websocket.WebSocketConfig.ChatWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private ChatWebSocketHandler wsHandler;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (req.getUsername() == null || req.getEmail() == null || req.getPassword() == null || req.getDisplayName() == null) {
            throw new IllegalArgumentException("All registration fields are required.");
        }

        String username = req.getUsername().trim().toLowerCase().replaceAll("[^a-z0-9_.]", "");
        if (username.length() < 3) {
            throw new IllegalArgumentException("Username must be at least 3 characters long.");
        }

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username is already taken.");
        }

        if (userRepository.existsByEmailIgnoreCase(req.getEmail().trim())) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        String defaultAvatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" + username;

        User user = User.builder()
                .username(username)
                .email(req.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .displayName(req.getDisplayName().trim())
                .avatarUrl(defaultAvatar)
                .role(User.Role.USER)
                .isPrivate(false)
                .isSuspended(false)
                .build();

        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user, user.getId()))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        if (req.getIdentifier() == null || req.getPassword() == null) {
            throw new IllegalArgumentException("Username/email and password are required.");
        }

        String id = req.getIdentifier().trim();
        User user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(id, id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or email."));

        if (Boolean.TRUE.equals(user.getIsSuspended())) {
            throw new IllegalStateException("Your account has been suspended by administration.");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Incorrect password.");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user, user.getId()))
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return mapToUserResponse(user, userId);
    }

    public UserResponse mapToUserResponse(User user, Long currentUserId) {
        long followers = followRepository.countByFollowingAndStatus(user, Follow.Status.ACCEPTED);
        long following = followRepository.countByFollowerAndStatus(user, Follow.Status.ACCEPTED);
        long unreadNotifs = currentUserId != null ? notificationRepository.countByRecipientAndIsReadFalse(user) : 0;
        long unreadMsgs = currentUserId != null ? messageRepository.countUnreadMessages(user.getId()) : 0;

        String followStatus = "NONE";
        boolean isFollower = false;

        if (currentUserId != null && !currentUserId.equals(user.getId())) {
            User currentUser = userRepository.findById(currentUserId).orElse(null);
            if (currentUser != null) {
                var f = followRepository.findByFollowerAndFollowing(currentUser, user);
                if (f.isPresent()) {
                    followStatus = f.get().getStatus().name();
                }
                isFollower = followRepository.existsByFollowerAndFollowingAndStatus(user, currentUser, Follow.Status.ACCEPTED);
            }
        }

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .coverUrl(user.getCoverUrl())
                .bio(user.getBio())
                .website(user.getWebsite())
                .location(user.getLocation())
                .socialLinks(user.getSocialLinks())
                .role(user.getRole().name())
                .isPrivate(user.getIsPrivate())
                .isVerified(Boolean.TRUE.equals(user.getIsVerified()))
                .isSuspended(user.getIsSuspended())
                .showOnlineStatus(Boolean.TRUE.equals(user.getShowOnlineStatus()))
                .allowMessagesFrom(user.getAllowMessagesFrom())
                .lastSeenAt(user.getLastSeenAt())
                .createdAt(user.getCreatedAt())
                .followersCount(followers)
                .followingCount(following)
                .postsCount(0L)
                .unreadNotificationsCount(unreadNotifs)
                .unreadMessagesCount(unreadMsgs)
                .followStatus(followStatus)
                .isFollower(isFollower)
                .isSelf(currentUserId != null && currentUserId.equals(user.getId()))
                .isOnline(Boolean.TRUE.equals(user.getShowOnlineStatus()) && wsHandler.isUserOnline(user.getId()))
                .build();
    }

    public PostResponse mapToPostResponse(Post post, Long currentUserId) {
        List<MediaItem> mediaItems = post.getMediaList().stream()
                .map(m -> MediaItem.builder().url(m.getMediaUrl()).type(m.getMediaType().name()).build())
                .collect(Collectors.toList());

        List<String> hashtags = post.getHashtags().stream()
                .map(Hashtag::getTag)
                .collect(Collectors.toList());

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
                .likesCount(0L)
                .commentsCount(0L)
                .isLiked(false)
                .isSaved(false)
                .media(mediaItems)
                .hashtags(hashtags)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    // In-memory OTP storage with timestamp for expiry (10 minutes)
    private static class OtpEntry {
        final String otp;
        final long createdAt;

        OtpEntry(String otp) {
            this.otp = otp;
            this.createdAt = System.currentTimeMillis();
        }

        boolean isExpired() {
            return (System.currentTimeMillis() - createdAt) > (10 * 60 * 1000); // 10 minutes
        }
    }

    private final Map<String, OtpEntry> otpStorage = new ConcurrentHashMap<>();

    public String sendOtpToEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        String cleanEmail = email.trim().toLowerCase();
        if (!userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new IllegalArgumentException("No account registered with this email address.");
        }

        // Generate 6-digit cryptographically secure OTP
        String otp = String.format("%06d", new java.security.SecureRandom().nextInt(1_000_000));
        otpStorage.put(cleanEmail, new OtpEntry(otp));

        System.out.println("================================================================================");
        System.out.println("🔑 [Password Reset OTP] Generated for: " + cleanEmail);
        System.out.println("👉 OTP Code: " + otp + " (Valid for 10 minutes)");
        System.out.println("================================================================================");

        return otp;
    }

    @Transactional
    public boolean verifyOtpAndResetPassword(String email, String otp, String newPassword) {
        if (email == null || otp == null || newPassword == null) {
            throw new IllegalArgumentException("Email, OTP, and new password are required.");
        }
        if (newPassword.trim().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }

        String cleanEmail = email.trim().toLowerCase();
        OtpEntry entry = otpStorage.get(cleanEmail);

        if (entry == null) {
            throw new IllegalArgumentException("No OTP requested for this email, or it has expired.");
        }

        if (entry.isExpired()) {
            otpStorage.remove(cleanEmail);
            throw new IllegalArgumentException("OTP has expired. Please request a new code.");
        }

        if (!entry.otp.equals(otp.trim())) {
            throw new IllegalArgumentException("Invalid OTP code. Please check and try again.");
        }

        User user = userRepository.findByEmailIgnoreCase(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException("User account not found."));

        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);

        // Invalidate OTP after successful reset
        otpStorage.remove(cleanEmail);

        System.out.println("✅ [Password Reset] Password reset successfully for: " + cleanEmail);
        return true;
    }
}
