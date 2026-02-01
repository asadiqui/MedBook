'use client';

import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

interface Message {
  id: string;
  content: string;
  isRead: boolean;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
}

export default function ChatMessages({ messages, currentUserId }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString([], {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  const isToday = (dateStr: string) => {
    const today = new Date().toLocaleDateString([], {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    return dateStr === today;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date Separator */}
          <div className="flex items-center justify-center my-6">
            <span className="px-4 py-1.5 bg-gray-200 text-xs text-gray-600 rounded-full">
              {isToday(date) ? 'Today' : date}
            </span>
          </div>
          {dateMessages.map((message, idx) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
              showAvatar={
                idx === 0 ||
                dateMessages[idx - 1].senderId !== message.senderId
              }
            />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
