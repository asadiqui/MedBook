'use client';

import { Check, CheckCheck, FileText, Download, Image as ImageIcon } from 'lucide-react';
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

// Parse attachment from content string format: [attachment:url:filename:mimetype]
function parseAttachment(content: string): { url: string; name: string; type: string } | null {
  const match = content.match(/^\[attachment:([^:]+):([^:]+):([^\]]+)\]$/);
  if (match) {
    return {
      url: match[1],
      name: match[2],
      type: match[3],
    };
  }
  return null;
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

  // Check for inline attachment format
  const inlineAttachment = parseAttachment(message.content);
  const isImageAttachment = inlineAttachment && inlineAttachment.type.startsWith('image/');
  const isFileAttachment = message.attachment || (inlineAttachment && !isImageAttachment);
  const attachmentData = message.attachment || (inlineAttachment ? {
    name: inlineAttachment.name,
    size: '',
    type: inlineAttachment.type,
  } : null);

  // Render image attachment
  if (isImageAttachment && inlineAttachment) {
    const imageUrl = inlineAttachment.url.startsWith('/') 
      ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${inlineAttachment.url}`
      : inlineAttachment.url;
    
    return (
      <div className={`flex items-end gap-2 mb-4 ${isOwn ? 'justify-end' : ''}`}>
        {showAvatar && !isOwn && <Avatar />}
        <div className={`max-w-xs rounded-lg overflow-hidden ${isOwn ? 'ml-auto' : ''}`}>
          <a href={imageUrl} target="_blank" rel="noopener noreferrer">
            <img 
              src={imageUrl} 
              alt={inlineAttachment.name}
              className="max-w-full h-auto rounded-lg hover:opacity-90 transition"
              style={{ maxHeight: '200px' }}
            />
          </a>
          <div className={`px-3 py-2 ${isOwn ? 'bg-blue-500' : 'bg-gray-200'}`}>
            <div className="flex items-center gap-1">
              <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                {formatTime(message.createdAt)}
              </span>
              {isOwn && (
                <span className="ml-1">
                  {message.isRead ? <CheckCheck className="w-4 h-4 text-blue-300" /> : <Check className="w-4 h-4 text-gray-300" />}
                </span>
              )}
            </div>
          </div>
        </div>
        {isOwn && showAvatar && <Avatar />}
      </div>
    );
  }

  // Render file attachment
  if (isFileAttachment && attachmentData) {
    const fileUrl = inlineAttachment 
      ? (inlineAttachment.url.startsWith('/') 
          ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${inlineAttachment.url}`
          : inlineAttachment.url)
      : '#';
    
    return (
      <div className={`flex items-end gap-2 mb-4 ${isOwn ? 'justify-end' : ''}`}>
        {showAvatar && !isOwn && <Avatar />}
        <div className={`max-w-xs bg-blue-50 border border-blue-100 rounded-lg p-3 ${isOwn ? 'ml-auto' : ''}`}>
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-blue-900 truncate">{attachmentData.name}</div>
              {attachmentData.size && (
                <div className="text-xs text-blue-600">{attachmentData.size}</div>
              )}
            </div>
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              download={attachmentData.name}
              className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-blue-400">{formatTime(message.createdAt)}</span>
            {isOwn && (
              <span className="ml-1">
                {message.isRead ? <CheckCheck className="w-4 h-4 text-blue-300" /> : <Check className="w-4 h-4 text-gray-400" />}
              </span>
            )}
          </div>
        </div>
        {isOwn && showAvatar && <Avatar />}
      </div>
    );
  }

  // Regular text message
  return (
    <div className={`flex items-end gap-2 mb-4 ${isOwn ? 'justify-end' : ''}`}>
      {showAvatar && !isOwn && <Avatar />}
      <div className={`max-w-xs rounded-lg p-3 ${isOwn ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 text-gray-900'}`}>
        <div className="text-sm">{message.content}</div>
        <div className="flex items-center gap-1 mt-2">
          <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>{formatTime(message.createdAt)}</span>
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
