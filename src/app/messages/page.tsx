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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 flex gap-4 max-w-4xl mx-auto lg:mx-0 w-full h-[calc(100vh-8rem)] pb-20 lg:pb-0">
          {/* Thread List Column */}
          <div className="w-full sm:w-80 glass-card p-3 space-y-3 flex flex-col border border-slate-800 shrink-0">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-cyan-400" size={18} />
                <h3 className="font-bold text-sm text-slate-100">Messages</h3>
              </div>
              <Badge variant="cyan" size="sm">Direct Chat</Badge>
            </div>

            <div className="space-y-1 overflow-y-auto flex-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full p-2.5 rounded-xl flex items-start gap-2.5 text-left transition-all ${
                    selectedConvId === conv.id
                      ? 'bg-slate-800/90 border border-slate-700'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div className="relative">
                    <Avatar alt={conv.participantName} src={conv.participantAvatar} size="md" isVerified={conv.participantVerified} />
                    {conv.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 truncate">{conv.participantName}</span>
                      <span className="text-[10px] text-slate-500">{conv.lastMessageTime}</span>
                    </div>
                    <p className="text-slate-400 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Chat Thread */}
          <div className="hidden sm:flex flex-1 glass-card p-4 flex-col justify-between border border-slate-800 relative">
            {/* Thread Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <Avatar alt={activeThread.participantName} src={activeThread.participantAvatar} size="md" isVerified />
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{activeThread.participantName}</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="text-cyan-400">@{activeThread.participantUsername}</span>
                    <span>•</span>
                    <span className={activeThread.isOnline ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                      {activeThread.isOnline ? 'Online Now' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              <button className="text-slate-400 hover:text-white p-1 rounded-lg">
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
                      className={`p-3 rounded-2xl text-xs space-y-2 ${
                        isMe
                          ? 'gradient-btn text-white rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p>{msg.content}</p>

                      {/* Paywalled Attachment */}
                      {msg.isPaywalled && (
                        <div className="mt-2 p-3 bg-slate-950/90 rounded-xl border border-indigo-500/30 space-y-2">
                          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                            <Lock size={14} />
                            <span>VIP Masterclass Attachment</span>
                          </div>

                          {msg.isUnlocked ? (
                            <img src={msg.mediaUrl} alt="Unlocked file" className="rounded-lg max-h-40 w-full object-cover" />
                          ) : (
                            <div className="text-center py-2 space-y-2">
                              <p className="text-[11px] text-slate-400">Unlock complete source code & Figma kit</p>
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

                      <span className="text-[9px] text-slate-400 block text-right">
                        {msg.createdAt}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Write a message to creator..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
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
