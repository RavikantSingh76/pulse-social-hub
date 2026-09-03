package com.socialmedia.controller;

import com.socialmedia.dto.Dtos.*;
import com.socialmedia.security.CustomUserDetailsService.UserPrincipal;
import com.socialmedia.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getConversations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        List<ConversationResponse> convs = messageService.getUserConversations(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(convs));
    }

    @PostMapping("/conversations/group")
    public ResponseEntity<ApiResponse<ConversationResponse>> createGroup(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CreateGroupRequest req) {

        ConversationResponse conv = messageService.createGroup(userPrincipal.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("Group created", conv));
    }

    @PostMapping("/conversations/{id}/members")
    public ResponseEntity<ApiResponse<String>> addGroupMembers(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestBody Map<String, List<Long>> body) {

        List<Long> memberIds = body.getOrDefault("memberIds", List.of());
        messageService.addGroupMembers(userPrincipal.getId(), id, memberIds);
        return ResponseEntity.ok(ApiResponse.success("Members added", "OK"));
    }

    @DeleteMapping("/conversations/{id}/members/{memberId}")
    public ResponseEntity<ApiResponse<String>> removeGroupMember(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @PathVariable Long memberId) {

        messageService.removeGroupMember(userPrincipal.getId(), id, memberId);
        return ResponseEntity.ok(ApiResponse.success("Member removed", "OK"));
    }

    @PostMapping("/conversations/{id}/leave")
    public ResponseEntity<ApiResponse<String>> leaveGroup(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        messageService.leaveGroup(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Left group", "OK"));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        List<MessageResponse> messages = messageService.getConversationMessages(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @GetMapping("/conversations/{id}/search")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> searchMessages(
            @PathVariable Long id,
            @RequestParam("q") String query) {

        List<MessageResponse> messages = messageService.searchMessages(id, query);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody SendMessageRequest request) {

        MessageResponse message = messageService.sendMessage(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    @PostMapping(value = "/messages/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessageWithMedia(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("conversationId") Long conversationId,
            @RequestParam("media") MultipartFile file,
            @RequestParam(value = "messageText", required = false) String text,
            @RequestParam(value = "replyToId", required = false) Long replyToId) {

        MessageResponse message = messageService.sendMessageWithMedia(userPrincipal.getId(), conversationId, file, text, replyToId);
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    @PostMapping("/messages/{id}/reaction")
    public ResponseEntity<ApiResponse<String>> toggleReaction(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam("type") String reactionType) {

        messageService.toggleMessageReaction(userPrincipal.getId(), id, reactionType);
        return ResponseEntity.ok(ApiResponse.success("Reaction updated", "OK"));
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<ApiResponse<String>> deleteMessageForEveryone(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        messageService.deleteMessageForEveryone(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Message deleted for everyone", "OK"));
    }
}
