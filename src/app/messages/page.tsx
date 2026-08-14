'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, Send, Image as ImageIcon, Lock, Sparkles, 
  Check, CheckCheck, MoreVertical, ShieldAlert, CheckCircle2 
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

  const activeThread = conversations.find((c) => c.id === selectedConvId) || conversations[0];
  const threadMessages = messages[selectedConvId] || [];

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
          {/* Thread List Column */}
          <div className="w-full sm:w-80 bg-white/95 backdrop-blur-md p-4 space-y-3 flex flex-col border border-[#F3DCE8] rounded-[24px] shrink-0 shadow-sm shadow-[#EC4899]/5">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-[#EC4899]" size={18} />
                <h3 className="font-extrabold text-sm text-[#18181B]">Messages</h3>
              </div>
              <Badge variant="pink" size="sm">Direct Chat</Badge>
            </div>

            <div className="space-y-1.5 overflow-y-auto flex-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full p-3 rounded-2xl flex items-start gap-3 text-left transition-all cursor-pointer ${
                    selectedConvId === conv.id
                      ? 'bg-[#FCE7F3] border border-[#FBCFE8] shadow-sm'
                      : 'hover:bg-[#FFF1F7]'
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
                      <span className="text-[10px] text-[#A1A1AA] font-medium">{conv.lastMessageTime}</span>
                    </div>
                    <p className="text-[#71717A] truncate mt-0.5 font-medium">{conv.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Chat Thread */}
          <div className="hidden sm:flex flex-1 bg-white/95 backdrop-blur-md p-5 flex-col justify-between border border-[#F3DCE8] rounded-[24px] shadow-sm shadow-[#EC4899]/5 relative">
            {/* Thread Header */}
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div className="flex items-center gap-3">
                <Avatar alt={activeThread.participantName} src={activeThread.participantAvatar} size="md" isVerified />
                <div>
                  <h4 className="font-extrabold text-sm text-[#18181B]">{activeThread.participantName}</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#71717A] font-medium">
                    <span className="text-[#BE185D] font-bold">@{activeThread.participantUsername}</span>
                    <span>•</span>
                    <span className={activeThread.isOnline ? 'text-emerald-600 font-bold' : 'text-[#A1A1AA]'}>
                      {activeThread.isOnline ? 'Online Now' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              <button className="text-[#71717A] hover:text-[#18181B] p-1.5 rounded-xl hover:bg-[#FFF9FC] cursor-pointer transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Messages Scroll Feed */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
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
                      className={`p-3.5 rounded-2xl text-xs space-y-2 font-medium ${
                        isMe
                          ? 'gradient-btn text-white rounded-tr-none shadow-md shadow-[#EC4899]/20'
                          : 'bg-[#FFF9FC] border border-[#F3DCE8] text-[#18181B] rounded-tl-none'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.content}</p>

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
                              <p className="text-[11px] text-[#71717A]">Unlock complete source code & Figma kit</p>
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

                      <span className={`text-[9px] block text-right font-semibold ${isMe ? 'text-white/80' : 'text-[#A1A1AA]'}`}>
                        {msg.createdAt}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-[#F3DCE8]">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Write a message to creator..."
                className="flex-1 bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-4 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] focus:bg-white transition-colors"
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
