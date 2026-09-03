package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.Notification;
import com.socialmedia.entity.NotificationPreference;
import com.socialmedia.entity.User;
import com.socialmedia.repository.NotificationPreferenceRepository;
import com.socialmedia.repository.NotificationRepository;
import com.socialmedia.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationPreferenceRepository preferenceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Transactional(readOnly = true)
    public List<GroupedNotificationResponse> getGroupedNotifications(Long userId, int page, int limit) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<Notification> rawList = notificationRepository.findByRecipientOrderByCreatedAtDesc(user, PageRequest.of(page - 1, limit * 2));

        // Group notifications by type and entity (e.g. LIKE + post_id:12)
        Map<String, List<Notification>> grouped = new LinkedHashMap<>();
        for (Notification n : rawList) {
            String key = n.getType().name() + "_" + n.getEntityType() + "_" + n.getEntityId();
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(n);
        }

        List<GroupedNotificationResponse> result = new ArrayList<>();
        for (Map.Entry<String, List<Notification>> entry : grouped.entrySet()) {
            List<Notification> items = entry.getValue();
            Notification latest = items.get(0);

            UserResponse primaryActor = userService.mapToUserResponse(latest.getActor(), userId);
            List<UserResponse> actors = items.stream().limit(3)
                    .map(n -> userService.mapToUserResponse(n.getActor(), userId))
                    .collect(Collectors.toList());

            long totalCount = items.size();
            String formattedMessage;
            if (totalCount == 1) {
                formattedMessage = primaryActor.getDisplayName() + " " + latest.getMessage();
            } else if (totalCount == 2) {
                formattedMessage = primaryActor.getDisplayName() + " and " + actors.get(1).getDisplayName() + " " + getActionVerb(latest.getType());
            } else {
                formattedMessage = primaryActor.getDisplayName() + ", " + actors.get(1).getDisplayName() + " and " + (totalCount - 2) + " others " + getActionVerb(latest.getType());
            }

            boolean anyUnread = items.stream().anyMatch(n -> Boolean.FALSE.equals(n.getIsRead()));

            result.add(GroupedNotificationResponse.builder()
                    .groupKey(entry.getKey())
                    .type(latest.getType().name())
                    .entityType(latest.getEntityType())
                    .entityId(latest.getEntityId())
                    .primaryActor(primaryActor)
                    .actors(actors)
                    .totalCount(totalCount)
                    .formattedMessage(formattedMessage)
                    .isRead(!anyUnread)
                    .latestTimestamp(latest.getCreatedAt())
                    .build());
        }

        return result;
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        notificationRepository.markAllAsReadForUser(user);
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getRecipient().getId().equals(userId)) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional(readOnly = true)
    public NotificationPreferenceResponse getPreferences(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        NotificationPreference pref = preferenceRepository.findByUser(user)
                .orElseGet(() -> preferenceRepository.save(NotificationPreference.builder().user(user).build()));

        return NotificationPreferenceResponse.builder()
                .notifyLikes(pref.getNotifyLikes())
                .notifyComments(pref.getNotifyComments())
                .notifyFollowers(pref.getNotifyFollowers())
                .notifyMessages(pref.getNotifyMessages())
                .notifyMentions(pref.getNotifyMentions())
                .notifyStories(pref.getNotifyStories())
                .build();
    }

    @Transactional
    public NotificationPreferenceResponse updatePreferences(Long userId, UpdateNotificationPreferenceRequest req) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        NotificationPreference pref = preferenceRepository.findByUser(user)
                .orElseGet(() -> NotificationPreference.builder().user(user).build());

        if (req.getNotifyLikes() != null) pref.setNotifyLikes(req.getNotifyLikes());
        if (req.getNotifyComments() != null) pref.setNotifyComments(req.getNotifyComments());
        if (req.getNotifyFollowers() != null) pref.setNotifyFollowers(req.getNotifyFollowers());
        if (req.getNotifyMessages() != null) pref.setNotifyMessages(req.getNotifyMessages());
        if (req.getNotifyMentions() != null) pref.setNotifyMentions(req.getNotifyMentions());
        if (req.getNotifyStories() != null) pref.setNotifyStories(req.getNotifyStories());

        pref = preferenceRepository.save(pref);

        return NotificationPreferenceResponse.builder()
                .notifyLikes(pref.getNotifyLikes())
                .notifyComments(pref.getNotifyComments())
                .notifyFollowers(pref.getNotifyFollowers())
                .notifyMessages(pref.getNotifyMessages())
                .notifyMentions(pref.getNotifyMentions())
                .notifyStories(pref.getNotifyStories())
                .build();
    }

    private String getActionVerb(Notification.Type type) {
        switch (type) {
            case LIKE: return "liked your post";
            case COMMENT: return "commented on your post";
            case FOLLOW: return "started following you";
            case MENTION: return "mentioned you";
            case MESSAGE: return "sent you messages";
            default: return "interacted with you";
        }
    }
}
