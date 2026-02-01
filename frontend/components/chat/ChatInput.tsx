'use client';

import { useState } from 'react';
import { Paperclip, Smile, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onTyping: () => void;
}

export default function ChatInput({ onSendMessage, onTyping }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping();
  };

  return (
    <div className="bg-white border-t border-gray-200">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center gap-3">
          {/* Attachment Button */}
          <button
            type="button"
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={handleChange}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Emoji Button */}
          <button
            type="button"
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
