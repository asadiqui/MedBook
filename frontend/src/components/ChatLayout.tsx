'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';

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

interface ChatLayoutProps {
  selectedBookingId?: string;
  onSelectChat?: (bookingId: string) => void;
}

export const ChatLayout = ({ selectedBookingId, onSelectChat }: ChatLayoutProps) => {
  const { user } = useAuthStore();
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<ChatInfo['otherUser'] | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNewMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

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

  const { sendMessage, sendTyping, markAllAsRead, isConnected } = useSocket({
    bookingId: selectedBookingId,
    onNewMessage: handleNewMessage,
    onTyping: handleTyping,
    onMessageRead: handleMessageRead,
  });

  // Fetch user's chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await api.get('/chat/my-chats');
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchChats();
    }
  }, [user]);

  // Fetch messages for selected booking
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedBookingId) return;

      try {
        const response = await api.get(`/chat/booking/${selectedBookingId}`);
        setMessages(response.data.messages);

        // Set other user from booking info
        const booking = response.data.booking;
        const other = booking.doctorId === user?.id ? booking.patient : booking.doctor;
        setOtherUser(other);

        // Mark all messages as read
        markAllAsRead();
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [selectedBookingId, user?.id, markAllAsRead]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUser) return;

    sendMessage(otherUser.id, newMessage.trim());
    setNewMessage('');
    sendTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    sendTyping(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Chat List Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          <div className="flex items-center mt-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></span>
            <span className="ml-2 text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.bookingId}
                onClick={() => onSelectChat?.(chat.bookingId)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                  selectedBookingId === chat.bookingId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    {chat.otherUser.avatar ? (
                      <img
                        src={chat.otherUser.avatar}
                        alt={chat.otherUser.firstName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-semibold">
                        {chat.otherUser.firstName[0]}
                        {chat.otherUser.lastName[0]}
                      </span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">
                        {chat.otherUser.role === 'DOCTOR' ? 'Dr. ' : ''}
                        {chat.otherUser.firstName} {chat.otherUser.lastName}
                      </h3>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {formatTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage?.content || 'No messages yet'}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-400">
                        Booking: {formatDate(chat.bookingDate)}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedBookingId && otherUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b border-gray-200 flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                {otherUser.avatar ? (
                  <img
                    src={otherUser.avatar}
                    alt={otherUser.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-semibold">
                    {otherUser.firstName[0]}
                    {otherUser.lastName[0]}
                  </span>
                )}
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">
                  {otherUser.role === 'DOCTOR' ? 'Dr. ' : ''}
                  {otherUser.firstName} {otherUser.lastName}
                </h3>
                {isTyping && (
                  <span className="text-sm text-gray-500">typing...</span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwn = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 rounded-bl-md shadow'
                      }`}
                    >
                      <p>{message.content}</p>
                      <div
                        className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                          isOwn ? 'text-blue-100' : 'text-gray-400'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                        {isOwn && (
                          <span>{message.isRead ? '✓✓' : '✓'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="bg-white p-4 border-t border-gray-200"
            >
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="mt-4 text-lg">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
