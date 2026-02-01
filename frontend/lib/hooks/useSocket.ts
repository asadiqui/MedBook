"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/lib/store/auth";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

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
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { bookingId, onNewMessage, onTyping, onMessageRead, onAllMessagesRead } = options;
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    socketRef.current = io(`${SOCKET_URL}/chat`, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    const socket = socketRef.current;

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

    // Listen for new messages
    socket.on("new_message", (message: Message) => {
      if (onNewMessage) onNewMessage(message);
    });

    // Listen for typing events
    socket.on("user_typing", (data: { userId: string; isTyping: boolean }) => {
      if (onTyping) onTyping(data);
    });

    // Listen for message read events
    socket.on("message_read", (message: Message) => {
      if (onMessageRead) onMessageRead(message);
    });

    // Listen for all messages read event
    socket.on("all_messages_read", (data: { bookingId: string; userId: string }) => {
      if (onAllMessagesRead) onAllMessagesRead(data);
    });

    return () => {
      if (bookingId) {
        socket.emit("leave_room", { bookingId });
      }
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, bookingId]);

  // Send a message
  const sendMessage = useCallback((receiverId: string, content: string) => {
    if (!socketRef.current || !user) return;
    socketRef.current.emit("send_message", {
      senderId: user.id,
      receiverId,
      content,
      bookingId,
    });
  }, [user, bookingId]);

  // Send typing event
  const sendTyping = useCallback((isTyping: boolean) => {
    if (!socketRef.current || !user) return;
    socketRef.current.emit("typing", {
      userId: user.id,
      isTyping,
      bookingId,
    });
  }, [user, bookingId]);

  // Mark all messages as read
  const markAllAsRead = useCallback(() => {
    if (!socketRef.current || !user || !bookingId) return;
    socketRef.current.emit("mark_all_read", {
      bookingId,
      userId: user.id,
    });
  }, [user, bookingId]);

  return {
    sendMessage,
    sendTyping,
    markAllAsRead,
    isConnected,
  };
};
