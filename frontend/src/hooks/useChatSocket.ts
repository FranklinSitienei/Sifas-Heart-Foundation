import { useEffect } from 'react';
import { connectSocket, getSocket } from '@/lib/socket';
import { useChatStore } from '@/store/useChatStore';

export const useChatSocket = (userId: string, token: string, role: 'user' | 'admin') => {
  const addMessage = useChatStore((s) => s.addMessage);
  const setTyping = useChatStore((s) => s.setTyping);
  const incrementUnread = useChatStore((s) => s.incrementUnread);

  useEffect(() => {
    if (!userId || !token) return;

    const socket = connectSocket(token);

    socket.emit('register', { userId, role });

    socket.on('newMessage', (message) => {
      addMessage(message);
      incrementUnread();
    });

    socket.on('typingStatus', ({ fromId, isTyping }) => {
      setTyping(isTyping);
    });

    socket.on('userOnlineStatus', ({ userId, isOnline }) => {
      console.log(`User ${userId} is now ${isOnline ? 'online' : 'offline'}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, token, role]);
};
