import { create } from 'zustand';
import api from '@/lib/api';

interface ChatStore {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: (by?: number) => void;
  fetchUnreadCount: () => Promise<void>;
}

export const useChatStore = create<ChatStore>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnreadCount: (by = 1) => set((state) => ({ 
    unreadCount: Math.max(0, state.unreadCount - by) 
  })),
  fetchUnreadCount: async () => {
    try {
      const response = await api.get('/chat/unread-count');
      set({ unreadCount: response.data.unreadCount || 0 });
    } catch (error) {
      // Ignore errors - user might not be logged in
    }
  },
}));
