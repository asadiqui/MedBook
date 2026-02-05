'use client';

import { useState, useRef, useEffect } from 'react';
import { Paperclip, Smile, Send, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface FileWithPreview {
  file: File;
  previewUrl: string | null;
  id: string;
}

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onTyping: () => void;
  onSendAttachment?: (file: File) => void;
  onSendAttachments?: (files: File[]) => void;
}

export default function ChatInput({ onSendMessage, onTyping, onSendAttachment, onSendAttachments }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Send all attachments
    if (selectedFiles.length > 0) {
      if (onSendAttachments) {
        // Use batch send if available
        onSendAttachments(selectedFiles.map(f => f.file));
      } else if (onSendAttachment) {
        // Fall back to sending one by one
        for (const fileWithPreview of selectedFiles) {
          onSendAttachment(fileWithPreview.file);
        }
      }
      clearAllFiles();
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
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles: FileWithPreview[] = Array.from(files).map(file => ({
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
    
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const clearAllFiles = () => {
    selectedFiles.forEach(f => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setSelectedFiles([]);
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

      {/* File Previews - Multiple files */}
      {selectedFiles.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected</span>
            {selectedFiles.length > 1 && (
              <button
                type="button"
                onClick={clearAllFiles}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((fileWithPreview) => (
              <div key={fileWithPreview.id} className="relative group">
                {fileWithPreview.previewUrl ? (
                  <img 
                    src={fileWithPreview.previewUrl} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded border border-gray-200" 
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex flex-col items-center justify-center p-1">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-[8px] text-gray-500 truncate w-full text-center mt-1">
                      {fileWithPreview.file.name.split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(fileWithPreview.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] px-1 truncate rounded-b">
                  {(fileWithPreview.file.size / 1024).toFixed(0)}KB
                </div>
              </div>
            ))}
            {/* Add more button */}
            <button
              type="button"
              onClick={openFilePicker}
              className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition"
            >
              <span className="text-2xl">+</span>
            </button>
          </div>
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
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={openFilePicker}
            className={`p-2 rounded-full transition ${
              selectedFiles.length > 0 
                ? 'text-blue-500 bg-blue-100' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Attach files"
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
            disabled={!message.trim() && selectedFiles.length === 0}
            className={`p-2 rounded-full transition ${
              message.trim() || selectedFiles.length > 0
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
