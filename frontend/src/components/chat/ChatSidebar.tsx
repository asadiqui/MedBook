'use client';

import { useState } from 'react';
import { Search, Edit } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
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

        {/* Doctor Tabs */}
        {isDoctor && (
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            {(['all', 'unread', 'archived'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={isDoctor ? 'Search patients, messages...' : 'Search messages...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Connection Status */}
      <div className="px-4 py-2 flex items-center gap-2 text-xs text-gray-500">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations found
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ConversationItem
              key={chat.bookingId}
              chat={chat}
              isSelected={selectedBookingId === chat.bookingId}
              onClick={() => onSelectChat(chat.bookingId)}
            />
          ))
        )}
      </div>
    </div>
  );
}
