"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/lib/store/auth";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

interface Message {
  id: string;
  content: string;
  isRead: boolean;
  bookingId: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    role: string;
  };
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    role: string;
  };
}

interface UseSocketOptions {
  bookingId?: string;
  onNewMessage?: (message: Message) => void;
  onTyping?: (data: { userId: string; isTyping: boolean }) => void;
  onMessageRead?: (message: Message) => void;
  onAllMessagesRead?: (data: { bookingId: string; userId: string }) => void;
  onUserStatus?: (data: { userId: string; isOnline: boolean }) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { bookingId, onNewMessage, onTyping, onMessageRead, onAllMessagesRead, onUserStatus } = options;
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;

    const socket = io(`${SOCKET_URL}/chat`, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("register_user", { userId: user.id });

      if (bookingId) {
        socket.emit("join_room", { bookingId, userId: user.id });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("new_message", (message: Message) => {
      if (onNewMessage) onNewMessage(message);
    });

    socket.on("user_typing", (data: { userId: string; isTyping: boolean }) => {
      if (onTyping) onTyping(data);
    });

    socket.on("message_read", (message: Message) => {
      if (onMessageRead) onMessageRead(message);
    });

    socket.on("all_messages_read", (data: { bookingId: string; userId: string }) => {
      if (onAllMessagesRead) onAllMessagesRead(data);
    });

    socket.on("user_status", (data: { userId: string; isOnline: boolean }) => {
      setOnlineUsers(prev => ({ ...prev, [data.userId]: data.isOnline }));
      if (onUserStatus) onUserStatus(data);
    });

    socket.on("online_statuses", (statuses: Record<string, boolean>) => {
      setOnlineUsers(prev => ({ ...prev, ...statuses }));
    });

    return () => {
      if (socket.connected || socket.io.engine?.readyState === 'open') {
        if (bookingId) {
          socket.emit("leave_room", { bookingId });
        }
        socket.disconnect();
      } else {
        socket.close();
      }
      socketRef.current = null;
    };

  }, [user, bookingId]);

  const sendMessage = useCallback((receiverId: string, content: string) => {
    if (!socketRef.current || !user) return;
    socketRef.current.emit("send_message", {
      senderId: user.id,
      receiverId,
      content,
      bookingId,
    });
  }, [user, bookingId]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!socketRef.current || !user) return;
    socketRef.current.emit("typing", {
      userId: user.id,
      isTyping,
      bookingId,
    });
  }, [user, bookingId]);

  const markAllAsRead = useCallback(() => {
    if (!socketRef.current || !user || !bookingId) return;
    socketRef.current.emit("mark_all_read", {
      bookingId,
      userId: user.id,
    });
  }, [user, bookingId]);

  const getOnlineStatus = useCallback((userIds: string[]) => {
    if (!socketRef.current) return;
    socketRef.current.emit("get_online_status", { userIds });
  }, []);

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers[userId] ?? false;
  }, [onlineUsers]);

  return {
    sendMessage,
    sendTyping,
    markAllAsRead,
    getOnlineStatus,
    isUserOnline,
    onlineUsers,
    isConnected,
  };
};
