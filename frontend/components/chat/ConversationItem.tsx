'use client';

import { useAuthStore } from '@/lib/store/auth';
import { resolveAvatarUrl } from '@/lib/utils/avatar';

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

interface ConversationItemProps {
  chat: ChatInfo;
  isSelected: boolean;
  onClick: () => void;
}

export default function ConversationItem({ chat, isSelected, onClick }: ConversationItemProps) {
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'DOCTOR';

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getInitials = () => {
    return `${chat.otherUser.firstName[0]}${chat.otherUser.lastName[0]}`;
  };

  const getAvatarColor = () => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    const index = chat.otherUser.firstName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 ${isSelected ? 'bg-blue-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor()} text-white font-semibold text-lg`}>
          {chat.otherUser.avatar ? (
            <img
              src={resolveAvatarUrl(chat.otherUser.avatar)}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            getInitials()
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">
              {isDoctor && chat.otherUser.role === 'PATIENT' ? '' : chat.otherUser.role === 'DOCTOR' ? 'Dr. ' : ''}
              {chat.otherUser.firstName} {chat.otherUser.lastName}
            </span>
            {chat.lastMessage && (
              <span className="text-xs text-gray-400 ml-2">{formatTime(chat.lastMessage.createdAt)}</span>
            )}
          </div>
          <div className="text-sm text-gray-500 truncate">
            {chat.lastMessage ? chat.lastMessage.content : 'No messages yet'}
          </div>
        </div>
        {chat.unreadCount > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
            {chat.unreadCount}
          </span>
        )}
      </div>
    </div>
  );
}
