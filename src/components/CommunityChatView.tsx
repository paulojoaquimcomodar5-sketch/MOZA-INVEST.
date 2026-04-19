import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, User, ShieldCheck } from 'lucide-react';
import socket from '../lib/socket';
import { User as UserType } from '../types';

interface Message {
  id: string;
  user: string;
  text: string;
  time: string;
  isAdmin: boolean;
}

interface CommunityChatViewProps {
  user: UserType | null;
  onBack: () => void;
}

export default function CommunityChatView({ user, onBack }: CommunityChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('initial_messages', (initialData: Message[]) => {
      setMessages(initialData);
    });

    socket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('initial_messages');
      socket.off('new_message');
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageData = {
      user: user?.phone || 'Anónimo',
      text: inputText,
      phone: user?.phone, // For admin verification
      isAdmin: false 
    };

    socket.emit('send_message', messageData);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] animate-fade relative">
      {/* Header */}
      <div className="px-6 flex items-center gap-4 mb-4">
        <button onClick={onBack} className="text-text-secondary hover:text-accent"><ArrowLeft size={24} /></button>
        <div>
          <h3 className="text-white font-serif italic text-xl">Chat da Família</h3>
          <p className="text-accent text-[8px] uppercase tracking-widest font-black">Admin Online • Suporte Direto</p>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 space-y-4 pb-4 custom-scrollbar"
      >
        {messages.map((msg) => {
          const isMe = msg.user === user?.phone;
          
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                {!isMe && (
                  <span className={`text-[8px] uppercase font-black tracking-widest ${msg.isAdmin ? 'text-accent' : 'text-text-secondary'}`}>
                    {msg.isAdmin ? 'ADMINISTRADOR' : msg.user}
                  </span>
                )}
                <span className="text-[7px] text-text-secondary font-mono">{msg.time}</span>
              </div>
              
              <div 
                className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  isMe 
                    ? 'bg-accent text-bg font-medium rounded-tr-none' 
                    : msg.isAdmin 
                      ? 'bg-accent/10 border border-accent/30 text-white rounded-tl-none' 
                      : 'bg-surface border border-border text-white rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSendMessage}
        className="px-6 py-4 bg-surface/50 backdrop-blur-sm border-t border-border flex gap-3 sticky bottom-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escreva para a família..."
          className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent transition-colors"
        />
        <button 
          type="submit"
          className="w-12 h-12 bg-accent text-bg rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg"
        >
          <Send size={20} />
        </button>
      </form>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
