import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, User, ShieldCheck, Bot, Sparkles } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import socket from '../lib/socket';
import { User as UserType } from '../types';
import { askMozaAI } from '../services/geminiService';

interface Message {
  id: string;
  user: string;
  text: string;
  content?: string; // Some server events used 'text' others 'content'
  time: string;
  isAdmin: boolean;
  isBroadcast?: boolean;
  timestamp?: number;
}

interface CommunityChatViewProps {
  user: UserType | null;
  onBack: () => void;
}

export default function CommunityChatView({ user, onBack }: CommunityChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen to messages in real-time from Firestore - Subscribe immediately for public read
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    }, (error) => {
      // Silent warning for public read permission issues if not authenticated
      if (!auth.currentUser && error.message.includes('permission')) {
        console.warn("[FIREBASE] Public read access failed. Check your security rules.");
      } else {
        handleFirestoreError(error, OperationType.LIST, 'messages');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Scroll to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentText = inputText;
    setInputText('');

    if (isAiMode) {
      setIsAiThinking(true);
      
      // Add user message locally for AI chat feel
      const userMsg: Message = {
        id: 'ai-user-' + Date.now(),
        user: user?.phone || 'Você',
        text: currentText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAdmin: false
      };
      setMessages(prev => [...prev, userMsg]);

      const aiReply = await askMozaAI(currentText, user?.name);
      
      const aiMsg: Message = {
        id: 'ai-bot-' + Date.now(),
        user: 'IA MOZA',
        text: aiReply || 'Estou processando sua dúvida...',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAdmin: true
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsAiThinking(false);
      setIsAiMode(false); // Disable AI mode after response
      return;
    }

    const messageData = {
      user: user?.phone || 'Anónimo',
      text: currentText,
      phone: user?.phone, // For admin verification
      isAdmin: false 
    };

    socket.emit('send_message', messageData);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] animate-fade relative">
      {/* Header */}
      <div className="px-6 flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-text-secondary hover:text-accent"><ArrowLeft size={24} /></button>
          <div>
            <h3 className="text-white font-serif italic text-xl">Chat da Família</h3>
            <p className="text-accent text-[8px] uppercase tracking-widest font-black">Admin Online • Suporte Direto</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsAiMode(!isAiMode)}
          className={`px-3 py-1.5 rounded-full flex items-center gap-2 border transition-all ${
            isAiMode 
              ? 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(255,184,0,0.2)]' 
              : 'bg-surface border-border text-text-secondary hover:border-accent/40'
          }`}
        >
          <Bot size={14} className={isAiMode ? 'animate-bounce' : ''} />
          <span className="text-[10px] font-black uppercase tracking-wider">Auxílio IA</span>
          {isAiMode && <Sparkles size={10} className="animate-pulse" />}
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 space-y-4 pb-4 custom-scrollbar"
      >
        {messages.map((msg) => {
          const isMe = msg.user === user?.phone;
          const isAi = msg.user === 'IA MOZA';
          const isBroadcast = msg.isBroadcast;
          const content = msg.text || msg.content;
          
          if (isBroadcast) {
            return (
              <div key={msg.id} className="w-full flex flex-col items-center my-8 relative">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent/30 to-transparent"></div>
                <div className="relative z-10 bg-[#1C162E] border border-accent/40 px-8 py-5 rounded-3xl flex items-center gap-4 shadow-2xl shadow-accent/10 sm:max-w-[90%] md:max-w-[400px]">
                  <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent shrink-0">
                     <ShieldCheck size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-accent tracking-[4px] block mb-1">Oficial Moza</span>
                    <p className="text-[14px] text-white font-medium italic leading-relaxed">"{content}"</p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                {!isMe && (
                  <span className={`text-[8px] uppercase font-black tracking-widest ${msg.isAdmin || isAi ? 'text-accent' : 'text-text-secondary'}`}>
                    {isAi ? 'IA MOZA ✧' : (msg.isAdmin ? 'ADMINISTRADOR' : msg.user)}
                  </span>
                )}
                <span className="text-[7px] text-text-secondary font-mono">{msg.time}</span>
              </div>
              
              <div 
                className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  isMe 
                    ? 'bg-accent text-bg font-medium rounded-tr-none' 
                    : isAi
                      ? 'bg-accent/5 border border-accent/20 text-white rounded-tl-none ring-1 ring-accent/10'
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
        {isAiThinking && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[8px] uppercase font-black tracking-widest text-accent">IA MOZA ✧</span>
            </div>
            <div className="bg-accent/5 border border-accent/20 p-3 rounded-2xl rounded-tl-none text-[13px] text-white/50 italic">
              Digitando resposta...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSendMessage}
        className={`px-6 py-4 bg-surface/50 backdrop-blur-sm border-t flex gap-3 sticky bottom-0 transition-colors ${
          isAiMode ? 'border-accent/40 bg-accent/5' : 'border-border'
        }`}
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText || ''}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isAiMode ? "Pergunte algo à IA Moza..." : "Escreva para a família..."}
            className={`w-full bg-bg border rounded-xl px-4 py-3 text-sm text-white outline-none transition-all ${
              isAiMode ? 'border-accent focus:ring-1 focus:ring-accent shadow-[0_0_10px_rgba(255,184,0,0.1)]' : 'border-border focus:border-accent'
            }`}
          />
          {isAiMode && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-accent animate-pulse">
              <Sparkles size={14} />
            </div>
          )}
        </div>
        <button 
          type="submit"
          disabled={isAiThinking}
          className={`w-12 h-12 rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg ${
            isAiMode ? 'bg-white text-accent animate-pulse' : 'bg-accent text-bg'
          }`}
        >
          {isAiThinking ? <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div> : <Send size={20} />}
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
