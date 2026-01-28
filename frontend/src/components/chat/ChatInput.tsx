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
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center mt-3 gap-2 text-xs text-gray-400">
          <span>Press Enter to send, Shift + Enter for new line</span>
        </div>
      </form>

      {/* Encryption Badge */}
      <div className="flex items-center justify-center pb-3 gap-1 text-xs text-gray-400">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>END-TO-END ENCRYPTED</span>
      </div>
    </div>
  );
}
