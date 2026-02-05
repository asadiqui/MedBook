"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useSocket } from "@/lib/hooks/useSocket";
import api from "@/lib/api";
import { useChatStore } from "@/lib/store/chat";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopHeader } from "@/components/shared/TopHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";

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

interface ChatInfo {
  bookingId: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    role: string;
  };
  lastMessage: Message | null;
  unreadCount: number;
  bookingDate: string;
  bookingStatus: string;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams?.get("bookingId");
  const { user, isAuthenticated, requireAuth, isBootstrapping } = useAuth();
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | undefined>(
    bookingIdParam || undefined
  );
  const [otherUser, setOtherUser] = useState<ChatInfo["otherUser"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isBootstrapping) return;
    const result = requireAuth();
    if (result !== null) {
      setAuthChecked(true);
    }
  }, [isBootstrapping, requireAuth]);

  const markAllAsReadRef = useRef<(() => void) | null>(null);

  const handleNewMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
    setChats((prev) => {
      const updated = prev.map((chat) => {
        if (chat.bookingId !== message.bookingId) return chat;
        const shouldIncrementUnread =
          message.receiverId === user?.id && message.bookingId !== selectedBookingId;
        return {
          ...chat,
          lastMessage: message,
          unreadCount: shouldIncrementUnread ? chat.unreadCount + 1 : chat.unreadCount,
        };
      });
      return [...updated].sort((a, b) => {
        const aTs = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const bTs = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return bTs - aTs;
      });
    });
    
    // Auto-mark as read if user is viewing this chat
    if (message.receiverId === user?.id && message.bookingId === selectedBookingId) {
      setTimeout(() => {
        if (markAllAsReadRef.current) {
          markAllAsReadRef.current();
        }
      }, 500);
    }
  }, [selectedBookingId, user?.id]);

  const handleTyping = useCallback((data: { userId: string; isTyping: boolean }) => {
    if (data.userId !== user?.id) {
      setIsTyping(data.isTyping);
    }
  }, [user?.id]);

  const handleMessageRead = useCallback((message: Message) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, isRead: true } : m))
    );
  }, []);

  const { sendMessage, sendTyping, markAllAsRead, getOnlineStatus, isUserOnline, isConnected } = useSocket({
    bookingId: selectedBookingId,
    onNewMessage: handleNewMessage,
    onTyping: handleTyping,
    onMessageRead: handleMessageRead,
  });

  markAllAsReadRef.current = markAllAsRead;

  useEffect(() => {
    if (otherUser && isConnected) {
      getOnlineStatus([otherUser.id]);
    }
  }, [otherUser, isConnected, getOnlineStatus]);


  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await api.get("/chat/my-chats");
        setChats(response.data);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchChats();
  }, [user]);


  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedBookingId) return;
      try {
        const response = await api.get(`/chat/booking/${selectedBookingId}`);
        setMessages(response.data.messages);
        const booking = response.data.booking;
        const other = booking.doctorId === user?.id ? booking.patient : booking.doctor;
        setOtherUser(other);
        markAllAsRead();
        const chatToUpdate = chats.find(c => c.bookingId === selectedBookingId);
        const unreadInThisChat = chatToUpdate?.unreadCount || 0;
        
        setChats((prev) =>
          prev.map((chat) =>
            chat.bookingId === selectedBookingId ? { ...chat, unreadCount: 0 } : chat
          )
        );
        
        if (unreadInThisChat > 0) {
          useChatStore.getState().decrementUnreadCount(unreadInThisChat);
        }
      } catch (error) {
        setMessages([]);
        setOtherUser(null);
      }
    };
    fetchMessages();
  }, [selectedBookingId, user?.id, markAllAsRead]);

  const handleSendMessage = (content: string) => {
    if (!otherUser) return;
    sendMessage(otherUser.id, content);
    sendTyping(false);
  };

  const handleSendAttachment = async (file: File) => {
    if (!otherUser || !selectedBookingId) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bookingId', selectedBookingId);
      formData.append('receiverId', otherUser.id);
      
      const response = await api.post('/chat/send-attachment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (response.data) {
        setMessages(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Failed to send attachment:', error);
    }
  };

  const handleTypingEvent = () => {
    sendTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTyping(false), 2000);
  };


  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const isAuthLoading = !authChecked || !user;

  if (isAuthLoading || isLoading) {
    return (
      <LoadingSpinner
        message=""
        className="flex items-center justify-center h-screen"
        sizeClassName="h-8 w-8"
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {}
      <Sidebar role={user?.role || 'PATIENT'} />
      {}
      <TopHeader title="Chat" />
      {}
      <div className="flex flex-1 ml-64 mt-16">
        {}
        <ChatSidebar
          chats={chats}
          selectedBookingId={selectedBookingId}
          onSelectChat={setSelectedBookingId}
          isConnected={isConnected}
        />
        {}
        <div className="flex-1 flex flex-col">
          {selectedBookingId && otherUser ? (
            <>
              <ChatHeader
                otherUser={otherUser}
                isTyping={isTyping}
                bookingId={selectedBookingId}
                isOnline={isUserOnline(otherUser.id)}
              />
              <ChatMessages
                messages={messages}
                currentUserId={user?.id || ''}
              />
              <ChatInput
                onSendMessage={handleSendMessage}
                onTyping={handleTypingEvent}
                onSendAttachment={handleSendAttachment}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Select a conversation</h3>
                <p className="text-sm text-gray-500">Choose a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
