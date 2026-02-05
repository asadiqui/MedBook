'use client';

import { useState, useRef, useEffect } from 'react';
import { Paperclip, Smile, Send, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onTyping: () => void;
  onSendAttachment?: (file: File) => void;
}

export default function ChatInput({ onSendMessage, onTyping, onSendAttachment }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFile && onSendAttachment) {
      onSendAttachment(selectedFile);
      clearFile();
    }
    
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
    
    setShowEmojiPicker(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping();
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setMessage(prev => prev + emojiData.emoji);
    onTyping();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white border-t border-gray-200">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-20 right-4 z-50">
          <EmojiPicker 
            onEmojiClick={handleEmojiClick}
            width={350}
            height={400}
            searchPlaceholder="Search emojis..."
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="p-3 border-b border-gray-100 flex items-center gap-3">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded" />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
              <Paperclip className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center gap-3">
          {/* Attachment button */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
          />
          <button
            type="button"
            onClick={openFilePicker}
            className={`p-2 rounded-full transition ${
              selectedFile 
                ? 'text-blue-500 bg-blue-100' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Message input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={handleChange}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Emoji button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-full transition ${
              showEmojiPicker 
                ? 'text-yellow-500 bg-yellow-100' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Send button */}
          <button
            type="submit"
            disabled={!message.trim() && !selectedFile}
            className={`p-2 rounded-full transition ${
              message.trim() || selectedFile
                ? 'text-blue-500 hover:bg-blue-100'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
