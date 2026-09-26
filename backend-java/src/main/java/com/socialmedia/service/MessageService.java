package com.socialmedia.service;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.entity.*;
import com.socialmedia.repository.*;
import com.socialmedia.websocket.WebSocketConfig.ChatWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.AccessDeniedException;
import com.socialmedia.util.FileUploadSecurityUtil;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ConversationMemberRepository memberRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ChatWebSocketHandler webSocketHandler;

    private static final String UPLOAD_DIR = "uploads/";

    @Transactional
    public MessageResponse sendMessage(Long senderId, SendMessageRequest request) {
        User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"));
        Conversation conversation;

        if (request.getConversationId() != null) {
            conversation = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
            boolean isMember = conversation.getMembers().stream()
                    .anyMatch(m -> m.getUser().getId().equals(senderId));
            if (!isMember) {
                throw new AccessDeniedException("User is not a member of this conversation");
            }
        } else if (request.getRecipientId() != null) {
            User recipient = userRepository.findById(request.getRecipientId())
                    .orElseThrow(() -> new RuntimeException("Recipient not found"));
            conversation = getOrCreateOneToOneConversation(sender, recipient);
        } else {
            throw new RuntimeException("Recipient or conversation required");
        }

        Message replyTo = null;
        if (request.getReplyToMessageId() != null) {
            replyTo = messageRepository.findById(request.getReplyToMessageId()).orElse(null);
        }

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .messageText(request.getMessageText())
                .mediaUrl(request.getMediaUrl())
                .replyToMessage(replyTo)
                .isForwarded(Boolean.TRUE.equals(request.getIsForwarded()))
                .build();

        message = messageRepository.save(message);
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        MessageResponse response = mapToMessageResponse(message);

        // Broadcast to conversation members via WebSocket
        List<Long> memberUserIds = conversation.getMembers().stream()
                .map(m -> m.getUser().getId())
                .filter(id -> !id.equals(senderId))
                .collect(Collectors.toList());

        for (Long recipientId : memberUserIds) {
            webSocketHandler.sendMessageToUser(recipientId, conversation.getId(), response);
        }

        return response;
    }

    @Transactional
    public MessageResponse sendMessageWithMedia(Long senderId, Long conversationId, MultipartFile file, String text, Long replyToId) {
        String mediaUrl = saveFile(file);

        SendMessageRequest req = SendMessageRequest.builder()
                .conversationId(conversationId)
                .messageText(text)
                .mediaUrl(mediaUrl)
                .replyToMessageId(replyToId)
                .build();

        return sendMessage(senderId, req);
    }

    // Group Chats
    @Transactional
    public ConversationResponse createGroup(Long adminId, CreateGroupRequest req) {
        User admin = userRepository.findById(adminId).orElseThrow(() -> new RuntimeException("User not found"));

        Conversation conv = Conversation.builder()
                .isGroup(true)
                .groupName(req.getGroupName() != null ? req.getGroupName() : "New Group")
                .groupAvatarUrl(req.getGroupAvatarUrl())
                .adminUser(admin)
                .build();

        conv = conversationRepository.save(conv);

        // Add admin as member
        ConversationMember adminMember = ConversationMember.builder()
                .conversation(conv)
                .user(admin)
                .build();
        memberRepository.save(adminMember);
        conv.getMembers().add(adminMember);

        final Conversation finalConv = conv;
        // Add initial members
        if (req.getMemberIds() != null) {
            for (Long memberId : req.getMemberIds()) {
                if (!memberId.equals(adminId)) {
                    userRepository.findById(memberId).ifPresent(u -> {
                        ConversationMember m = ConversationMember.builder().conversation(finalConv).user(u).build();
                        memberRepository.save(m);
                        finalConv.getMembers().add(m);
                    });
                }
            }
        }

        return mapToConversationResponse(conv, adminId);
    }

    @Transactional
    public void addGroupMembers(Long adminId, Long conversationId, List<Long> memberIds) {
        Conversation conv = conversationRepository.findById(conversationId).orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!Boolean.TRUE.equals(conv.getIsGroup())) throw new RuntimeException("Not a group conversation");

        for (Long memberId : memberIds) {
            userRepository.findById(memberId).ifPresent(u -> {
                if (memberRepository.findByConversationAndUser(conv, u).isEmpty()) {
                    ConversationMember m = ConversationMember.builder().conversation(conv).user(u).build();
                    memberRepository.save(m);
                }
            });
        }
    }

    @Transactional
    public void removeGroupMember(Long adminId, Long conversationId, Long memberUserId) {
        Conversation conv = conversationRepository.findById(conversationId).orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!Boolean.TRUE.equals(conv.getIsGroup())) throw new RuntimeException("Not a group conversation");
        if (conv.getAdminUser() != null && !conv.getAdminUser().getId().equals(adminId)) {
            throw new RuntimeException("Only group admin can remove members");
        }

        User user = userRepository.findById(memberUserId).orElseThrow(() -> new RuntimeException("User not found"));
        memberRepository.findByConversationAndUser(conv, user).ifPresent(memberRepository::delete);
    }

    @Transactional
    public void leaveGroup(Long userId, Long conversationId) {
        Conversation conv = conversationRepository.findById(conversationId).orElseThrow(() -> new RuntimeException("Conversation not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        memberRepository.findByConversationAndUser(conv, user).ifPresent(memberRepository::delete);
    }

    // Message Reactions
    @Transactional
    public void toggleMessageReaction(Long userId, Long messageId, String reactionTypeStr) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Message message = messageRepository.findById(messageId).orElseThrow(() -> new RuntimeException("Message not found"));

        Reaction.ReactionType requestedType = reactionTypeStr != null
                ? Reaction.ReactionType.valueOf(reactionTypeStr.toUpperCase())
                : Reaction.ReactionType.LIKE;

        Optional<Reaction> existing = reactionRepository.findByUserAndMessage(user, message);
        if (existing.isPresent()) {
            Reaction r = existing.get();
            if (r.getReactionType() == requestedType) {
                reactionRepository.delete(r);
            } else {
                r.setReactionType(requestedType);
                reactionRepository.save(r);
            }
        } else {
            Reaction r = Reaction.builder().user(user).message(message).reactionType(requestedType).build();
            reactionRepository.save(r);
        }
    }

    @Transactional
    public void deleteMessageForEveryone(Long userId, Long messageId) {
        Message message = messageRepository.findById(messageId).orElseThrow(() -> new RuntimeException("Message not found"));
        if (!message.getSender().getId().equals(userId)) {
            throw new RuntimeException("Only sender can delete message for everyone");
        }
        message.setIsDeletedForEveryone(true);
        message.setMessageText("This message was deleted");
        message.setMediaUrl(null);
        messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> searchMessages(Long conversationId, Long currentUserId, String query) {
        Conversation conv = conversationRepository.findById(conversationId).orElseThrow(() -> new RuntimeException("Conversation not found"));
        boolean isMember = conv.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(currentUserId));
        if (!isMember) {
            throw new AccessDeniedException("User is not a member of this conversation");
        }
        return messageRepository.findByConversationOrderByCreatedAtAsc(conv).stream()
                .filter(m -> m.getMessageText() != null && m.getMessageText().toLowerCase().contains(query.toLowerCase()))
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getUserConversations(Long userId) {
        List<Conversation> convs = conversationRepository.findUserConversations(userId);
        return convs.stream().map(c -> mapToConversationResponse(c, userId)).collect(Collectors.toList());
    }

    @Transactional
    public List<MessageResponse> getConversationMessages(Long conversationId, Long currentUserId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        boolean isMember = conv.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(currentUserId));
        if (!isMember) {
            throw new AccessDeniedException("User is not a member of this conversation");
        }

        List<Message> messages = messageRepository.findByConversationOrderByCreatedAtAsc(conv);
        for (Message m : messages) {
            if (!m.getSender().getId().equals(currentUserId) && Boolean.FALSE.equals(m.getIsRead())) {
                m.setIsRead(true);
                messageRepository.save(m);
            }
        }

        return messages.stream().map(this::mapToMessageResponse).collect(Collectors.toList());
    }

    private Conversation getOrCreateOneToOneConversation(User user1, User user2) {
        List<Conversation> list1 = conversationRepository.findUserConversations(user1.getId());
        for (Conversation c : list1) {
            if (Boolean.FALSE.equals(c.getIsGroup())) {
                boolean containsBoth = c.getMembers().stream().anyMatch(m -> m.getUser().getId().equals(user2.getId()));
                if (containsBoth) return c;
            }
        }

        Conversation newConv = Conversation.builder().isGroup(false).build();
        newConv = conversationRepository.save(newConv);

        ConversationMember m1 = ConversationMember.builder().conversation(newConv).user(user1).build();
        ConversationMember m2 = ConversationMember.builder().conversation(newConv).user(user2).build();

        memberRepository.save(m1);
        memberRepository.save(m2);

        newConv.getMembers().add(m1);
        newConv.getMembers().add(m2);
        return newConv;
    }

    public MessageResponse mapToMessageResponse(Message m) {
        MessageQuoteResponse replyToQuote = null;
        if (m.getReplyToMessage() != null) {
            replyToQuote = MessageQuoteResponse.builder()
                    .id(m.getReplyToMessage().getId())
                    .senderId(m.getReplyToMessage().getSender().getId())
                    .senderUsername(m.getReplyToMessage().getSender().getUsername())
                    .messageText(m.getReplyToMessage().getMessageText())
                    .mediaUrl(m.getReplyToMessage().getMediaUrl())
                    .build();
        }

        Map<String, Long> reactionCounts = new HashMap<>();
        for (Reaction r : m.getReactions()) {
            reactionCounts.put(r.getReactionType().name(), reactionCounts.getOrDefault(r.getReactionType().name(), 0L) + 1L);
        }

        return MessageResponse.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSender().getId())
                .senderUsername(m.getSender().getUsername())
                .senderDisplayName(m.getSender().getDisplayName())
                .senderAvatarUrl(m.getSender().getAvatarUrl())
                .messageText(m.getMessageText())
                .mediaUrl(m.getMediaUrl())
                .mediaType(m.getMediaType())
                .isForwarded(Boolean.TRUE.equals(m.getIsForwarded()))
                .isDeletedForEveryone(Boolean.TRUE.equals(m.getIsDeletedForEveryone()))
                .isRead(m.getIsRead())
                .replyTo(replyToQuote)
                .reactions(reactionCounts)
                .createdAt(m.getCreatedAt())
                .build();
    }

    public ConversationResponse mapToConversationResponse(Conversation c, Long currentUserId) {
        UserResponse otherUser = null;
        List<UserResponse> members = c.getMembers().stream()
                .map(m -> userService.mapToUserResponse(m.getUser(), currentUserId))
                .collect(Collectors.toList());

        if (Boolean.FALSE.equals(c.getIsGroup())) {
            for (ConversationMember m : c.getMembers()) {
                if (!m.getUser().getId().equals(currentUserId)) {
                    otherUser = userService.mapToUserResponse(m.getUser(), currentUserId);
                    break;
                }
            }
        }

        MessageResponse lastMsg = null;
        if (!c.getMessages().isEmpty()) {
            lastMsg = mapToMessageResponse(c.getMessages().get(c.getMessages().size() - 1));
        }

        long unread = c.getMessages().stream()
                .filter(m -> !m.getSender().getId().equals(currentUserId) && Boolean.FALSE.equals(m.getIsRead()))
                .count();

        return ConversationResponse.builder()
                .id(c.getId())
                .isGroup(Boolean.TRUE.equals(c.getIsGroup()))
                .groupName(c.getGroupName())
                .groupAvatarUrl(c.getGroupAvatarUrl())
                .otherUser(otherUser)
                .members(members)
                .lastMessage(lastMsg)
                .unreadCount(unread)
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private String saveFile(MultipartFile file) {
        try {
            return FileUploadSecurityUtil.storeMedia(file, UPLOAD_DIR);
        } catch (Exception e) {
            throw new RuntimeException("Failed to store media file: " + e.getMessage());
        }
    }
}
