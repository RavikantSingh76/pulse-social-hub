import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());

  const addEventListener = useCallback((event, callback) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event).add(callback);
    return () => {
      listenersRef.current.get(event)?.delete(callback);
    };
  }, []);

  const sendWsMessage = useCallback((data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = window.location.hostname === 'localhost'
      ? 'ws://localhost:8080/ws'
      : `${protocol}//${window.location.host}/ws`;

    let socket;
    let reconnectTimeout;

    const connect = () => {
      socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        // Register current user session
        socket.send(JSON.stringify({ action: 'REGISTER', userId: user.id }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const action = data.action;

          if (action === 'ONLINE_STATUS') {
            setOnlineUsers(prev => {
              const next = new Set(prev);
              if (data.isOnline) next.add(data.userId);
              else next.delete(data.userId);
              return next;
            });
          } else if (action === 'TYPING') {
            setTypingUsers(prev => ({
              ...prev,
              [data.senderId]: data.isTyping
            }));
          } else if (action === 'NEW_NOTIFICATION') {
            toast(data.message || 'You have a new notification!', { icon: '🔔' });
          }

          // Trigger registered callbacks
          const callbacks = listenersRef.current.get(action);
          if (callbacks) {
            callbacks.forEach(cb => cb(data));
          }
        } catch (err) {
          // Ignore non-JSON
        }
      };

      socket.onclose = () => {
        reconnectTimeout = setTimeout(() => {
          if (user) connect();
        }, 4000);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (socket) socket.close();
    };
  }, [user]);

  const emitTyping = (recipientId, isTyping) => {
    if (!user) return;
    sendWsMessage({
      action: 'TYPING',
      senderId: user.id,
      recipientId,
      isTyping
    });
  };

  return (
    <SocketContext.Provider value={{
      onlineUsers,
      typingUsers,
      emitTyping,
      addEventListener,
      sendWsMessage
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
