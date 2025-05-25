import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const ChatContext = createContext(null);

export const ChatProvider = ({ userId, token, role, children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [unread, setUnread] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Socket Setup ---
  useEffect(() => {
    if (!userId || !token) return;

    const s = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    setSocket(s);

    s.on('connect', () => {
      setIsConnected(true);
      s.emit('register', { userId, role });
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    s.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setUnread((u) => u + 1);
    });

    s.on('typingStatus', ({ isTyping }) => {
      setIsTyping(isTyping);
    });

    return () => {
      s.disconnect();
    };
  }, [userId, token, role]);

  // --- Fallback polling if socket disconnects ---
  useEffect(() => {
    if (!userId || isConnected) {
      clearInterval(pollIntervalRef.current!);
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/conversation/${userId}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Polling failed:', err);
      }
    }, 5000);

    return () => clearInterval(pollIntervalRef.current!);
  }, [userId, isConnected]);

  const sendMessage = (text: string, receiverId: string) => {
    if (!socket) return;

    socket.emit('sendMessage', { text, fromId: userId, toId: receiverId, fromRole: role });
  };

  const value = {
    messages,
    setMessages,
    isTyping,
    unread,
    setUnread,
    sendMessage,
    socket,
    isConnected,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
