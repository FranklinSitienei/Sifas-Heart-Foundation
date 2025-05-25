import { create } from 'zustand';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: string;
  isRead: boolean;
}

interface ChatState {
  messages: Message[];
  typing: boolean;
  unreadCount: number;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setTyping: (typing: boolean) => void;
  incrementUnread: () => void;
  resetUnread: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  typing: false,
  unreadCount: 0,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setTyping: (typing) => set({ typing }),
  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
}));
