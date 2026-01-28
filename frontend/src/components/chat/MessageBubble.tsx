'use client';

import { Check, CheckCheck, FileText, Download } from 'lucide-react';

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
          src={message.sender.avatar}
          alt=""
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <span className="text-gray-600 text-xs font-medium">{getInitials()}</span>
      )}
    </div>
  );

  // Check if message is a file attachment
  const isFileAttachment = message.attachment;

  if (isFileAttachment && message.attachment) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 gap-2`}>
        {/* Avatar for received messages */}
        {!isOwn && showAvatar && <Avatar />}
        
        <div className="max-w-[70%]">
          {/* File Attachment */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {message.attachment.name}
                </p>
                <p className="text-xs text-gray-500">{message.attachment.size}</p>
              </div>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatTime(message.createdAt)}
          </div>
        </div>

        {/* Avatar for sent messages */}
        {isOwn && showAvatar && <Avatar />}
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 gap-2`}>
      {/* Avatar for received messages */}
      {!isOwn && showAvatar && <Avatar />}

      <div className="max-w-[70%]">
        <div
          className={`rounded-2xl px-4 py-3 ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <div
          className={`flex items-center gap-1 mt-1 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}
        >
          <span className="text-xs text-gray-400">
            {formatTime(message.createdAt)}
          </span>
          {isOwn && (
            <span className="text-blue-500">
              {message.isRead ? (
                <CheckCheck className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Avatar for sent messages */}
      {isOwn && showAvatar && <Avatar />}
    </div>
  );
}
