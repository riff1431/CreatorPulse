'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '../layouts/MainLayout';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { MessageSquare, Send, Sparkles, Search, Gift, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  lastMessage: string;
  time: string;
  unreadCount: number;
  messages: ChatMessage[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Sarah Jenkins',
    username: 'sarahdesign',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    isVerified: true,
    lastMessage: 'Thanks for subscribing to the VIP Tier! Here is the download link 🎨',
    time: '5m ago',
    unreadCount: 1,
    messages: [
      { id: 'm1', sender: 'other', text: 'Hey there! Welcome to the VIP community!', time: '10:30 AM' },
      { id: 'm2', sender: 'me', text: 'Thank you Sarah! Excited to learn UI and design systems.', time: '10:32 AM' },
      { id: 'm3', sender: 'other', text: 'Thanks for subscribing to the VIP Tier! Here is the download link 🎨', time: '10:35 AM' },
    ],
  },
  {
    id: 'conv-2',
    name: 'Marcus Vance',
    username: 'marcus_beats',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isVerified: true,
    lastMessage: 'Sent you the synthwave stems pack!',
    time: '2h ago',
    unreadCount: 0,
    messages: [
      { id: 'm21', sender: 'other', text: 'Sent you the synthwave stems pack!', time: '8:15 AM' },
    ],
  },
];

export function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>('conv-1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConv) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: messageInput.trim(),
      time: 'Just now',
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              lastMessage: newMsg.text,
              time: 'Just now',
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    setMessageInput('');
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="bg-white dark:bg-[#1A1222] rounded-3xl border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-sm h-[78vh] flex overflow-hidden">
        
        {/* Left: Conversations Directory */}
        <div className={`w-full md:w-80 border-r border-[#F3DCE8] dark:border-[#3A2A4C] flex flex-col ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#F3DCE8] dark:border-[#3A2A4C] space-y-3">
            <h2 className="font-black text-base text-[#18181B] dark:text-[#FDF2F8]">Direct Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-[#FFF9FC] dark:bg-[#241A30] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredConversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    setMobileShowChat(true);
                  }}
                  className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#FFF1F7] dark:bg-[#381A2B] border border-[#FBCFE8] dark:border-[#4C1D3B]'
                      : 'hover:bg-[#FFF9FC] dark:hover:bg-[#241A30]'
                  }`}
                >
                  <Avatar alt={conv.name} src={conv.avatar} size="md" isVerified={conv.isVerified} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#18181B] dark:text-[#FDF2F8] truncate">{conv.name}</h4>
                      <span className="text-[10px] text-[#A1A1AA] dark:text-[#8E7890]">{conv.time}</span>
                    </div>
                    <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#EC4899] shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        <div className={`flex-1 flex-col justify-between bg-[#FFF9FC] dark:bg-[#0F0A14] ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white dark:bg-[#1A1222] border-b border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-1.5 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30]"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <Avatar alt={activeConv.name} src={activeConv.avatar} size="sm" isVerified={activeConv.isVerified} />
                  <div>
                    <h3 className="font-bold text-xs text-[#18181B] dark:text-[#FDF2F8]">{activeConv.name}</h3>
                    <span className="text-[10px] text-[#71717A] dark:text-[#D4B8D0]">@{activeConv.username}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/c/${activeConv.username}`}>
                    <Button variant="outline" size="sm" leftIcon={<Gift size={13} className="text-[#EC4899]" />}>
                      <span>Tip</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeConv.messages.map((msg) => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-[#EC4899] to-[#F43F5E] text-white rounded-br-xs shadow-xs'
                            : 'bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] text-[#18181B] dark:text-[#FDF2F8] rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-[#A1A1AA] mt-1 px-1">{msg.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-[#1A1222] border-t border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-[#FFF9FC] dark:bg-[#241A30] border border-[#F3DCE8] dark:border-[#3A2A4C] focus:border-[#EC4899] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none"
                />
                <Button type="submit" variant="primary" size="sm">
                  <Send size={14} />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-center mx-auto text-[#EC4899] shadow-sm">
                  <MessageSquare size={20} />
                </div>
                <h3 className="font-bold text-sm text-[#18181B] dark:text-[#FDF2F8]">Select a conversation</h3>
                <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">Chat directly with your creators and supporters.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default MessagesPage;
