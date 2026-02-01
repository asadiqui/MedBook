'use client';

import { useState } from 'react';
import { Search, Edit } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import ConversationItem from './ConversationItem';

interface ChatInfo {
  bookingId: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    role: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  unreadCount: number;
}

interface ChatSidebarProps {
  chats: ChatInfo[];
  selectedBookingId?: string;
  onSelectChat: (bookingId: string) => void;
  isConnected: boolean;
}

export default function ChatSidebar({
  chats,
  selectedBookingId,
  onSelectChat,
  isConnected,
}: ChatSidebarProps) {
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'DOCTOR';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');

  const filteredChats = chats.filter((chat) => {
    const name = `${chat.otherUser.firstName} ${chat.otherUser.lastName}`.toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase());
    
    if (activeTab === 'unread') {
      return matchesSearch && chat.unreadCount > 0;
    }
    return matchesSearch;
  });

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <Edit className="w-5 h-5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${activeTab === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${activeTab === 'unread' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
            onClick={() => setActiveTab('unread')}
          >
            Unread
          </button>
        </div>
      </div>
      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No conversations</div>
        ) : (
          filteredChats.map((chat) => (
            <ConversationItem
              key={chat.bookingId}
              chat={chat}
              isSelected={chat.bookingId === selectedBookingId}
              onClick={() => onSelectChat(chat.bookingId)}
            />
          ))
        )}
      </div>
    </div>
  );
}
