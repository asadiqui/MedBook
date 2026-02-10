import { create } from "zustand";
import api from "@/lib/api";

export type NotificationItem = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
};

type NotificationsStore = {
  unreadCount: number;
  items: NotificationItem[];

  setUnreadCount: (count: number) => void;
  incrementUnread: (by?: number) => void;
  decrementUnread: (by?: number) => void;

  setItems: (items: NotificationItem[]) => void;
  prependItem: (item: NotificationItem) => void;

  fetchUnreadCount: () => Promise<void>;
  fetchList: () => Promise<void>;

  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  unreadCount: 0,
  items: [],

  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: (by = 1) =>
    set((state) => ({ unreadCount: state.unreadCount + by })),
  decrementUnread: (by = 1) =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - by) })),

  setItems: (items) => set({ items }),
  prependItem: (item) => set((state) => ({ items: [item, ...state.items] })),

  fetchUnreadCount: async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      set({ unreadCount: res.data.unreadCount || 0 });
    } catch {}
  },

  fetchList: async () => {
    try {
      const res = await api.get("/notifications");
      set({ items: res.data || [] });
    } catch {}
  },

  markRead: async (id: string) => {
    const before = get().items.find((x) => x.id === id);
    if (before?.isRead) return;

    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => ({
        items: state.items.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(
          0,
          state.unreadCount - (before && !before.isRead ? 1 : 0)
        ),
      }));
    } catch {}
  },

  markAllRead: async () => {
    try {
      await api.patch("/notifications/read-all");
      set((state) => ({
        items: state.items.map((n) =>
          n.isRead ? n : { ...n, isRead: true, readAt: new Date().toISOString() }
        ),
        unreadCount: 0,
      }));
    } catch {}
  },
}));
