'use client';

import { Check, CheckCheck, FileText, Download } from 'lucide-react';
import { resolveAvatarUrl } from '@/lib/utils/avatar';

interface Message {
  id: string;
  content: string;
  isRead: boolean;
  senderId: string;
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

export default function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = () => {
    if (!message.sender) return '?';
    return `${message.sender.firstName[0]}${message.sender.lastName[0]}`;
  };

  const Avatar = () => (
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
      {message.sender?.avatar ? (
        <img
          src={resolveAvatarUrl(message.sender.avatar)}
          alt=""
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <span className="text-gray-600 text-xs font-medium">{getInitials()}</span>
      )}
    </div>
  );

  const isFileAttachment = message.attachment;

  if (isFileAttachment && message.attachment) {
    return (
      <div className={`flex items-end gap-2 mb-4 ${isOwn ? 'justify-end' : ''}`}>
        {showAvatar && !isOwn && <Avatar />}
        <div className={`max-w-xs bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center gap-3 ${isOwn ? 'ml-auto' : ''}`}>
          <FileText className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-sm font-medium text-blue-900">{message.attachment.name}</div>
            <div className="text-xs text-blue-600">{message.attachment.size}</div>
          </div>
          <button className="ml-2 p-1 text-blue-500 hover:bg-blue-100 rounded-full">
            <Download className="w-4 h-4" />
          </button>
        </div>
        {isOwn && showAvatar && <Avatar />}
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 mb-4 ${isOwn ? 'justify-end' : ''}`}>
      {showAvatar && !isOwn && <Avatar />}
      <div className={`max-w-xs rounded-lg p-3 ${isOwn ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 text-gray-900'}`}>
        <div className="text-sm">{message.content}</div>
        <div className="flex items-center gap-1 mt-2">
          <span className="text-xs text-gray-400">{formatTime(message.createdAt)}</span>
          {isOwn && (
            <span className="ml-1">
              {message.isRead ? <CheckCheck className="w-4 h-4 text-blue-300" /> : <Check className="w-4 h-4 text-gray-300" />}
            </span>
          )}
        </div>
      </div>
      {isOwn && showAvatar && <Avatar />}
    </div>
  );
}
