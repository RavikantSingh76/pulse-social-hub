package com.socialmedia.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHandler chatWebSocketHandler;

    public WebSocketConfig(ChatWebSocketHandler chatWebSocketHandler) {
        this.chatWebSocketHandler = chatWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatWebSocketHandler, "/ws")
                .setAllowedOriginPatterns("*");
    }

    @Component
    public static class ChatWebSocketHandler extends TextWebSocketHandler {

        private final Map<Long, WebSocketSession> userSessions = new ConcurrentHashMap<>();
        private final ObjectMapper objectMapper = new ObjectMapper();

        @Override
        public void afterConnectionEstablished(WebSocketSession session) {
            // Handshake completed
        }

        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
            try {
                Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
                String action = (String) payload.get("action");

                if ("REGISTER".equals(action)) {
                    Number userIdNum = (Number) payload.get("userId");
                    if (userIdNum != null) {
                        Long userId = userIdNum.longValue();
                        userSessions.put(userId, session);
                        broadcastOnlineStatus(userId, true);
                    }
                } else if ("TYPING".equals(action)) {
                    Number recipientIdNum = (Number) payload.get("recipientId");
                    if (recipientIdNum != null) {
                        sendToUser(recipientIdNum.longValue(), payload);
                    }
                } else if ("CALL_REQUEST".equals(action) ||
                           "CALL_ACCEPT".equals(action) ||
                           "CALL_REJECT".equals(action) ||
                           "CALL_OFFER".equals(action) ||
                           "CALL_ANSWER".equals(action) ||
                           "ICE_CANDIDATE".equals(action) ||
                           "CALL_END".equals(action)) {
                    // WebRTC peer-to-peer signaling dispatcher
                    Number targetIdNum = (Number) payload.get("targetUserId");
                    if (targetIdNum != null) {
                        sendToUser(targetIdNum.longValue(), payload);
                    }
                }
            } catch (Exception e) {
                // Ignore malformed frames
            }
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
            userSessions.entrySet().removeIf(entry -> {
                if (entry.getValue().getId().equals(session.getId())) {
                    broadcastOnlineStatus(entry.getKey(), false);
                    return true;
                }
                return false;
            });
        }

        public void sendToUser(Long userId, Object data) {
            WebSocketSession session = userSessions.get(userId);
            if (session != null && session.isOpen()) {
                try {
                    String json = objectMapper.writeValueAsString(data);
                    session.sendMessage(new TextMessage(json));
                } catch (IOException ignored) {}
            }
        }

        public void sendMessageToUser(Long userId, Long conversationId, Object messageObj) {
            sendToUser(userId, Map.of(
                    "action", "NEW_MESSAGE",
                    "conversationId", conversationId,
                    "message", messageObj
            ));
        }

        public void sendNotificationToUser(Long userId, String message) {
            sendToUser(userId, Map.of(
                    "action", "NEW_NOTIFICATION",
                    "message", message
            ));
        }

        public void broadcast(Object data) {
            try {
                String json = objectMapper.writeValueAsString(data);
                TextMessage message = new TextMessage(json);
                for (WebSocketSession session : userSessions.values()) {
                    if (session.isOpen()) {
                        session.sendMessage(message);
                    }
                }
            } catch (Exception ignored) {}
        }

        private void broadcastOnlineStatus(Long userId, boolean isOnline) {
            broadcast(Map.of("action", "ONLINE_STATUS", "userId", userId, "isOnline", isOnline));
        }

        public boolean isUserOnline(Long userId) {
            WebSocketSession s = userSessions.get(userId);
            return s != null && s.isOpen();
        }
    }
}
