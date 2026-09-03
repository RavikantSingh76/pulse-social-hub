package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.Comment;
import com.socialmedia.entity.CommentLike;
import com.socialmedia.entity.Notification;
import com.socialmedia.entity.Post;
import com.socialmedia.entity.User;
import com.socialmedia.repository.PostRepository;
import com.socialmedia.repository.CommentLikeRepository;
import com.socialmedia.repository.CommentRepository;
import com.socialmedia.repository.NotificationRepository;
import com.socialmedia.repository.UserRepository;
import com.socialmedia.websocket.WebSocketConfig.ChatWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private CommentLikeRepository commentLikeRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ChatWebSocketHandler wsHandler;

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        return commentRepository.findByPostAndParentCommentIsNullOrderByCreatedAtAsc(post).stream()
                .map(c -> mapToCommentResponse(c, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse createComment(Long userId, Long postId, CreateCommentRequest req) {
        if (req.getContent() == null || req.getContent().isBlank()) {
            throw new IllegalArgumentException("Comment content cannot be empty.");
        }

        User user = userRepository.findById(userId).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));

        Comment parent = null;
        if (req.getParentId() != null) {
            parent = commentRepository.findById(req.getParentId()).orElse(null);
        }

        Comment comment = Comment.builder()
                .user(user)
                .post(post)
                .parentComment(parent)
                .content(req.getContent().trim())
                .build();

        comment = commentRepository.save(comment);

        // Notifications
        if (parent != null && !parent.getUser().getId().equals(userId)) {
            Notification notif = Notification.builder()
                    .recipient(parent.getUser())
                    .actor(user)
                    .type(Notification.Type.REPLY)
                    .entityId(postId)
                    .entityType("POST")
                    .message("replied to your comment.")
                    .build();
            notificationRepository.save(notif);
            wsHandler.sendToUser(parent.getUser().getId(), Map.of("action", "NEW_NOTIFICATION", "message", user.getDisplayName() + " replied to your comment."));
        } else if (!post.getUser().getId().equals(userId)) {
            Notification notif = Notification.builder()
                    .recipient(post.getUser())
                    .actor(user)
                    .type(Notification.Type.COMMENT)
                    .entityId(postId)
                    .entityType("POST")
                    .message("commented on your post.")
                    .build();
            notificationRepository.save(notif);
            wsHandler.sendToUser(post.getUser().getId(), Map.of("action", "NEW_NOTIFICATION", "message", user.getDisplayName() + " commented on your post."));
        }

        return mapToCommentResponse(comment, userId);
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        boolean isAuthor = comment.getUser().getId().equals(userId);
        boolean isPostAuthor = comment.getPost().getUser().getId().equals(userId);

        if (!isAuthor && !isPostAuthor && !isAdmin) {
            throw new IllegalArgumentException("Unauthorized to delete this comment.");
        }

        commentRepository.delete(comment);
    }

    @Transactional
    public Map<String, Object> toggleCommentLike(Long userId, Long commentId) {
        User user = userRepository.findById(userId).orElseThrow();
        Comment comment = commentRepository.findById(commentId).orElseThrow();

        var existing = commentLikeRepository.findByUserAndComment(user, comment);
        boolean isLiked;
        if (existing.isPresent()) {
            commentLikeRepository.delete(existing.get());
            isLiked = false;
        } else {
            commentLikeRepository.save(CommentLike.builder().user(user).comment(comment).build());
            isLiked = true;
        }

        long likesCount = commentLikeRepository.countByComment(comment);
        return Map.of("is_liked", isLiked, "likes_count", likesCount, "comment_id", commentId);
    }

    private CommentResponse mapToCommentResponse(Comment comment, Long currentUserId) {
        long likesCount = commentLikeRepository.countByComment(comment);
        boolean isLiked = false;
        if (currentUserId != null) {
            User currentUser = userRepository.findById(currentUserId).orElse(null);
            if (currentUser != null) {
                isLiked = commentLikeRepository.existsByUserAndComment(currentUser, comment);
            }
        }

        List<CommentResponse> replies = commentRepository.findByParentCommentOrderByCreatedAtAsc(comment).stream()
                .map(r -> mapToCommentResponse(r, currentUserId))
                .collect(Collectors.toList());

        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .userId(comment.getUser().getId())
                .username(comment.getUser().getUsername())
                .displayName(comment.getUser().getDisplayName())
                .avatarUrl(comment.getUser().getAvatarUrl())
                .parentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .content(comment.getContent())
                .likesCount(likesCount)
                .isLiked(isLiked)
                .replies(replies)
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
