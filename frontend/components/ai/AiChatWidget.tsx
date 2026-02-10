'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

interface AiChatWidgetProps {
  mode: 'floating' | 'embedded';
  agentId: 'rag' | 'llm';
  title?: string;
  // welcomeMessage removed from props to enforce internal defaults
}

const WELCOME_MESSAGES = {
  rag: "Hi! I can help you find doctors, check hours, or answer questions about our services.",
  llm: "Describe your symptoms in detail, and I'll generate a summary for your doctor."
};

export default function AiChatWidget({ 
  mode, 
  agentId, 
  title = 'AI Assistant', 
}: AiChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const defaultWelcome = WELCOME_MESSAGES[agentId] || WELCOME_MESSAGES['llm'];

  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: defaultWelcome }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load history when widget opens or mounts
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        
        if (!token) return;

        const res = await fetch(`${API_URL}/ai/llm/history/${agentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const history = await res.json();
          if (history && history.length > 0) {
            setMessages([
              { id: 'welcome', role: 'assistant', content: defaultWelcome },
              ...history.map((h: any) => ({
                id: h.id,
                role: h.role,
                content: h.content
              }))
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    };

    if (isOpen || mode === 'embedded') {
      fetchHistory();
    }
  }, [isOpen, mode, agentId, defaultWelcome]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen || mode === 'embedded') {
      scrollToBottom();
    }
  }, [messages, isOpen, mode]);

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your chat history?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      await fetch(`${API_URL}/ai/llm/history/${agentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setMessages([{ id: 'welcome', role: 'assistant', content: defaultWelcome }]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  // Maintain focus on input when loading finishes
  useEffect(() => {
    if (!loading && (isOpen || mode === 'embedded')) {
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [loading, isOpen, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    // Input focus is now handled by the useEffect above

    try {
      // Create a placeholder message for the assistant
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '', // Start empty
        isLoading: true,
      };
      setMessages(prev => [...prev, assistantMessage]);

      const token = localStorage.getItem('accessToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_URL}/ai/llm/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          agentId,
          message: userMessage.content,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: 'Please log in to continue chatting.', isLoading: false } 
                : msg
            )
          );
          return;
        }

        if (response.status === 429 || response.status === 403) {
          // Parse the error message from backend
          const errorData = await response.json().catch(() => ({}));
          // Use backend message or a generic fallback
          const errorMessage = errorData.message || 'Request failed. Please try again later.';

          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: errorMessage, isLoading: false } 
                : msg
            )
          );
          return;
        }
        throw new Error(response.statusText || 'Failed to connect to AI');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: accumulatedContent, isLoading: false } // streaming updates 
                : msg
            )
          );
        }
      }

    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      // If we already handled the 429 above, we won't be here (state updated directly).
      // If we are here, it's a real unexpected error.
      
      setMessages(prev => {
        // Find if there is a loading message to update
        const hasLoading = prev.some(msg => msg.isLoading && msg.role === 'assistant');
        if (hasLoading) {
           return prev.map(msg => 
              msg.isLoading 
                ? { ...msg, content: `Error: ${error.message || 'Unknown error'}. Please try again.`, isLoading: false }
                : msg
           );
        }
        // Fallback: append new error message
        return [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: `Error: ${error.message || 'Unknown error'}. Please try again.`,
        }];
      });
    } finally {
      setLoading(false);
      // Ensure the final message is not marked as loading
      setMessages(prev => prev.map(msg => ({ ...msg, isLoading: false })));
    }
  };

  // Styles based on mode
  const containerClasses = mode === 'floating'
    ? `fixed bottom-6 right-6 z-50 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-96 h-[500px]' : 'w-auto h-auto'}`
    : 'w-full h-[600px] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200';

  const chatWindowClasses = mode === 'floating'
    ? `flex-1 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 hidden'}`
    : 'flex-1 overflow-hidden flex flex-col rounded-xl';

  const toggleButton = mode === 'floating' && (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={`${isOpen ? 'hidden' : 'flex'} items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </button>
  );

  return (
    <div className={containerClasses}>
      {/* Messages Area */}
      <div className={chatWindowClasses}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{title}</h3>
            {mode === 'embedded' && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">AI Powered</span>}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleClearHistory}
              title="Clear History"
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            {mode === 'floating' && (
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.isLoading && !msg.content ? (
                  <div className="flex space-x-2 h-6 items-center px-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                ) : (
                  <div className={`prose text-sm ${msg.role === 'user' ? 'prose-invert' : ''} max-w-none`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {toggleButton}
    </div>
  );
}
