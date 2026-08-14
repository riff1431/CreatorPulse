'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, Send, Image as ImageIcon, Lock, Sparkles, 
  Check, CheckCheck, MoreVertical, ShieldAlert, CheckCircle2, ChevronLeft, AlertCircle
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { 
  MOCK_CONVERSATIONS, MOCK_MESSAGES, ConversationThread, MessageItem 
} from '@/lib/supabase/store';

export default function MessagesPage() {
  const [conversations] = useState<ConversationThread[]>(MOCK_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');
  const [messages, setMessages] = useState<Record<string, MessageItem[]>>(MOCK_MESSAGES);
  const [textInput, setTextInput] = useState('');
  
  // Custom states
  const [mobileView, setMobileView] = useState<'threads' | 'chat'>('threads');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = conversations.find((c) => c.id === selectedConvId) || conversations[0];
  const threadMessages = messages[selectedConvId] || [];

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll when messages update, or typing status changes
  useEffect(() => {
    scrollToBottom();
  }, [threadMessages, isTyping, selectedConvId]);

  // Handle switching conversations (loading & typing simulators)
  useEffect(() => {
    let typingTimer: NodeJS.Timeout;
    
    const timer1 = setTimeout(() => {
      setIsChatLoading(true);
      setIsTyping(false);
    }, 0);
    
    const loadTimer = setTimeout(() => {
      setIsChatLoading(false);
      setIsTyping(true);
      typingTimer = setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(loadTimer);
      if (typingTimer) clearTimeout(typingTimer);
    };
  }, [selectedConvId]);



  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const newMsg: MessageItem = {
      id: `m-${Date.now()}`,
      conversationId: selectedConvId,
      senderId: 'user-member',
      senderName: 'Alex Vance',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      content: textInput.trim(),
      isRead: true,
      createdAt: 'Just now'
    };

    setMessages({
      ...messages,
      [selectedConvId]: [...threadMessages, newMsg]
    });
    setTextInput('');
  };

  const handleUnlockMessage = (msgId: string) => {
    const updated = threadMessages.map((m) =>
      m.id === msgId ? { ...m, isUnlocked: true } : m
    );
    setMessages({ ...messages, [selectedConvId]: updated });
  };

  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 flex gap-4 max-w-4xl mx-auto lg:mx-0 w-full h-[calc(100vh-8rem)] pb-20 lg:pb-0">
          
          {/* Thread List Column (Responsive) */}
          <div className={`${
            mobileView === 'threads' ? 'w-full flex' : 'hidden'
          } sm:w-80 sm:flex bg-white/95 backdrop-blur-md p-4 space-y-3 flex-col border border-[#F3DCE8] rounded-[24px] shrink-0 shadow-sm shadow-[#EC4899]/5 h-full`}>
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-[#EC4899]" size={18} />
                <h3 className="font-extrabold text-sm text-[#18181B]">Messages</h3>
              </div>
              <Badge variant="pink" size="sm">Direct Chat</Badge>
            </div>

            <div className="space-y-1.5 overflow-y-auto flex-1 scrollbar-none">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConvId(conv.id);
                    setMobileView('chat');
                  }}
                  className={`w-full p-3 rounded-2xl flex items-start gap-3 text-left transition-all cursor-pointer border ${
                    selectedConvId === conv.id
                      ? 'bg-[#FCE7F3] border-[#FBCFE8] shadow-sm'
                      : 'hover:bg-[#FFF1F7] border-transparent'
                  }`}
                >
                  <div className="relative">
                    <Avatar alt={conv.participantName} src={conv.participantAvatar} size="md" isVerified={conv.participantVerified} />
                    {conv.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#18181B] truncate">{conv.participantName}</span>
                      <span className="text-[10px] text-[#A1A1AA] font-semibold">{conv.lastMessageTime}</span>
                    </div>
                    <p className="text-[#71717A] truncate mt-0.5 font-semibold">{conv.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Chat Thread (Responsive) */}
          <div className={`${
            mobileView === 'chat' ? 'w-full flex' : 'hidden'
          } sm:flex flex-1 bg-white/95 backdrop-blur-md p-5 flex-col justify-between border border-[#F3DCE8] rounded-[24px] shadow-sm shadow-[#EC4899]/5 h-full relative`}>
            
            {/* Thread Header */}
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div className="flex items-center gap-3">
                {/* Back button for mobile view */}
                <button 
                  onClick={() => setMobileView('threads')}
                  className="sm:hidden p-1.5 hover:bg-[#FFF9FC] rounded-full border border-[#F3DCE8] text-[#71717A] hover:text-[#18181B]"
                >
                  <ChevronLeft size={16} />
                </button>

                <Avatar alt={activeThread.participantName} src={activeThread.participantAvatar} size="md" isVerified />
                <div>
                  <h4 className="font-extrabold text-sm text-[#18181B]">{activeThread.participantName}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#71717A] font-bold">
                    <span className="text-[#BE185D]">@{activeThread.participantUsername}</span>
                    <span>•</span>
                    <span className={activeThread.isOnline ? 'text-emerald-600' : 'text-[#A1A1AA]'}>
                      {activeThread.isOnline ? 'Online Now' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              <button className="text-[#71717A] hover:text-[#18181B] p-1.5 rounded-xl hover:bg-[#FFF9FC] cursor-pointer transition-colors border border-transparent hover:border-[#F3DCE8]">
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Messages Scroll Feed */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-none">
              {isChatLoading ? (
                // Shimmer loaders for message bubbles
                <div className="space-y-4">
                  <div className="flex gap-2.5 max-w-[70%]">
                    <div className="w-8 h-8 rounded-full skeleton-shimmer" />
                    <div className="w-44 h-12 skeleton-shimmer rounded-2xl rounded-tl-none" />
                  </div>
                  <div className="flex gap-2.5 max-w-[70%] ml-auto flex-row-reverse">
                    <div className="w-8 h-8 rounded-full skeleton-shimmer" />
                    <div className="w-56 h-10 skeleton-shimmer rounded-2xl rounded-tr-none" />
                  </div>
                </div>
              ) : (
                <>
                  {threadMessages.map((msg) => {
                    const isMe = msg.senderId === 'user-member';
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 max-w-[85%] ${
                          isMe ? 'ml-auto flex-row-reverse' : ''
                        }`}
                      >
                        <Avatar alt={msg.senderName} src={msg.senderAvatar} size="sm" />
                        <div
                          className={`p-3.5 rounded-2xl text-xs space-y-2 font-semibold ${
                            isMe
                              ? 'gradient-btn text-white rounded-tr-none shadow-md shadow-[#EC4899]/15'
                              : 'bg-[#FFF9FC] border border-[#F3DCE8] text-[#18181B] rounded-tl-none'
                          }`}
                        >
                          <p className="leading-relaxed font-semibold">{msg.content}</p>

                          {/* Paywalled Attachment */}
                          {msg.isPaywalled && (
                            <div className="mt-2 p-3 bg-white rounded-xl border border-[#F3DCE8] space-y-2 shadow-sm">
                              <div className="flex items-center gap-2 text-[#BE185D] font-bold text-xs">
                                <Lock size={14} className="text-[#EC4899]" />
                                <span>VIP Masterclass Attachment</span>
                              </div>

                              {msg.isUnlocked ? (
                                <img src={msg.mediaUrl} alt="Unlocked file" className="rounded-lg max-h-40 w-full object-cover" />
                              ) : (
                                <div className="text-center py-2 space-y-2">
                                  <p className="text-[10px] text-[#71717A] font-bold">Unlock complete source code & Figma kit</p>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleUnlockMessage(msg.id)}
                                  >
                                    Unlock File (${msg.unlockPrice?.toFixed(2)})
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                          <span className={`text-[9px] block text-right font-bold ${isMe ? 'text-white/80' : 'text-[#A1A1AA]'}`}>
                            {msg.createdAt}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator Bubble */}
                  {isTyping && (
                    <div className="flex items-start gap-2.5 max-w-[80%]">
                      <Avatar alt={activeThread.participantName} src={activeThread.participantAvatar} size="sm" />
                      <div className="bg-[#FFF9FC] border border-[#F3DCE8] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                      </div>
                    </div>
                  )}

                  {/* Ref marker to scroll to bottom */}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-[#F3DCE8]">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Write message to ${activeThread.participantName}...`}
                className="flex-1 bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-4 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] focus:bg-white transition-colors font-semibold"
              />
              <Button type="submit" variant="primary" size="sm" leftIcon={<Send size={14} />}>
                Send
              </Button>
            </form>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
