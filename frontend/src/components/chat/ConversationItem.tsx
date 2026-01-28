'use client';

import { useAuthStore } from '@/lib/auth';

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
      className={`p-4 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 ${
        isSelected ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            chat.otherUser.avatar ? '' : getAvatarColor()
          }`}>
            {chat.otherUser.avatar ? (
              <img
                src={chat.otherUser.avatar}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold">{getInitials()}</span>
            )}
          </div>
          {/* Online indicator */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 truncate">
              {chat.otherUser.role === 'DOCTOR' ? 'Dr. ' : ''}
              {chat.otherUser.firstName} {chat.otherUser.lastName}
            </h3>
            {chat.lastMessage && (
              <span className={`text-xs ${chat.unreadCount > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                {formatTime(chat.lastMessage.createdAt)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-500 truncate">
              {chat.lastMessage?.content || 'No messages yet'}
            </p>
            {chat.unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-medium rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
