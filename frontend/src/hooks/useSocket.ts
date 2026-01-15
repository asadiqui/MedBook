'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/auth';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

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
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🟢 Socket connected:', socket.id);
      setIsConnected(true);

      // Register user
      socket.emit('register_user', { userId: user.id });

      // Join room if bookingId provided
      if (bookingId) {
        socket.emit('join_room', { bookingId, userId: user.id });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
      setIsConnected(false);
    });

    socket.on('new_message', (message: Message) => {
      console.log('📨 New message received:', message);
      onNewMessage?.(message);
    });

    socket.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
      onTyping?.(data);
    });

    socket.on('message_read', (message: Message) => {
      onMessageRead?.(message);
    });

    socket.on('all_messages_read', (data: { bookingId: string; userId: string }) => {
      onAllMessagesRead?.(data);
    });

    return () => {
      if (bookingId) {
        socket.emit('leave_room', { bookingId });
      }
      socket.disconnect();
    };
  }, [user, bookingId, onNewMessage, onTyping, onMessageRead, onAllMessagesRead]);

  const sendMessage = useCallback(
    (receiverId: string, content: string) => {
      if (!socketRef.current || !user || !bookingId) return;

      socketRef.current.emit('send_message', {
        bookingId,
        senderId: user.id,
        receiverId,
        content,
      });
    },
    [user, bookingId]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!socketRef.current || !user || !bookingId) return;

      socketRef.current.emit('typing', {
        bookingId,
        userId: user.id,
        isTyping,
      });
    },
    [user, bookingId]
  );

  const markAsRead = useCallback(
    (messageId: string) => {
      if (!socketRef.current || !bookingId) return;

      socketRef.current.emit('mark_read', {
        messageId,
        bookingId,
      });
    },
    [bookingId]
  );

  const markAllAsRead = useCallback(() => {
    if (!socketRef.current || !user || !bookingId) return;

    socketRef.current.emit('mark_all_read', {
      bookingId,
      userId: user.id,
    });
  }, [user, bookingId]);

  const joinRoom = useCallback(
    (newBookingId: string) => {
      if (!socketRef.current || !user) return;

      socketRef.current.emit('join_room', {
        bookingId: newBookingId,
        userId: user.id,
      });
    },
    [user]
  );

  const leaveRoom = useCallback((oldBookingId: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit('leave_room', { bookingId: oldBookingId });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    sendTyping,
    markAsRead,
    markAllAsRead,
    joinRoom,
    leaveRoom,
  };
};

export default useSocket;
