'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { MainLayout } from '../layouts/MainLayout';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { TipModal } from '../components/TipModal';
import { 
  MessageSquare, Send, Sparkles, Search, Gift, 
  MoreVertical, ArrowLeft, Image as ImageIcon, 
  Smile, ShieldCheck, Star, Heart, Lock, Unlock,
  Check, CheckCheck, Play, Pause, Volume2, X,
  Info, ExternalLink, Paperclip, Flame, ThumbsUp,
  PartyPopper, Compass, RefreshCw, ChevronRight,
  UserCheck, Download, Radio, Phone, Video
} from 'lucide-react';
import { prefersReducedMotion } from '../utils/animations';

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
  isRead?: boolean;
  isDelivered?: boolean;
  isTip?: boolean;
  tipAmount?: number;
  tipCheer?: string;
  isPaywalled?: boolean;
  unlockPrice?: number;
  isUnlocked?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
  isAudio?: boolean;
  audioDuration?: string;
  replyTo?: { id: string; sender: string; text: string };
  reactions?: { emoji: string; count: number; userReacted?: boolean }[];
}

export interface Conversation {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  isVip: boolean;
  isOnline: boolean;
  lastActive: string;
  bio?: string;
  tierName?: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  messages: ChatMessage[];
  sharedMedia?: string[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Sarah Jenkins',
    username: 'sarahdesign',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    isVerified: true,
    isVip: true,
    isOnline: true,
    lastActive: 'Active now',
    bio: 'Lead 3D & Motion Designer. Crafting procedural shaders in Blender 4.2 & UI animation masterclasses.',
    tierName: 'VIP Pro Designer Tier ($14.99/mo)',
    lastMessage: 'Here is the 4K procedural shader source file for VIP members! 🎨',
    time: '3m ago',
    unreadCount: 1,
    sharedMedia: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
    ],
    messages: [
      {
        id: 'm1',
        sender: 'other',
        text: 'Hey Alex! Welcome to the VIP Pro Designer community! So glad to have you here 🎉',
        time: '10:30 AM',
        isRead: true,
        reactions: [{ emoji: '❤️', count: 2, userReacted: true }]
      },
      {
        id: 'm2',
        sender: 'me',
        text: 'Thank you Sarah! Loving the latest 3D render breakdown and project assets. The lighting setup is incredible!',
        time: '10:32 AM',
        isRead: true,
        isDelivered: true,
      },
      {
        id: 'm3',
        sender: 'other',
        text: '🔒 Exclusive Member Source File: Download the complete procedural lighting rig & Figma Token system.',
        time: '10:35 AM',
        isRead: false,
        isPaywalled: true,
        unlockPrice: 5.00,
        isUnlocked: false,
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        mediaType: 'image'
      },
      {
        id: 'm4',
        sender: 'other',
        text: '🎙️ Quick audio breakdown on how to tweak the chromatic aberration node:',
        time: '10:36 AM',
        isRead: false,
        isAudio: true,
        audioDuration: '0:42'
      }
    ],
  },
  {
    id: 'conv-2',
    name: 'Marcus Vance',
    username: 'marcuscode',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    isVerified: true,
    isVip: true,
    isOnline: false,
    lastActive: '20m ago',
    bio: 'Full-stack Next.js architect & cloud consultant. Shipping real-time web products.',
    tierName: 'VIP Full-Stack Insider ($19.99/mo)',
    lastMessage: 'Sent you the GitHub repo invite for the Next.js 15 starter template!',
    time: '2h ago',
    unreadCount: 0,
    sharedMedia: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400'
    ],
    messages: [
      {
        id: 'm21',
        sender: 'me',
        text: 'Hey Marcus, saw your new live stream about Supabase RLS security rules!',
        time: '8:10 AM',
        isRead: true,
        isDelivered: true,
      },
      {
        id: 'm22',
        sender: 'other',
        text: 'Sent you the GitHub repo invite for the Next.js 15 starter template! Check your email for access.',
        time: '8:15 AM',
        isRead: true,
        reactions: [{ emoji: '🚀', count: 1, userReacted: false }]
      },
    ],
  },
  {
    id: 'conv-3',
    name: 'Elena Rostova',
    username: 'elenadesign',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    isVerified: true,
    isVip: false,
    isOnline: true,
    lastActive: 'Active now',
    bio: 'Design systems engineer & typography enthusiast. Founder of TypeLab Studio.',
    lastMessage: 'The new interactive workshop on variable fonts starts tomorrow at 6 PM UTC!',
    time: '1d ago',
    unreadCount: 0,
    sharedMedia: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400'
    ],
    messages: [
      {
        id: 'm31',
        sender: 'other',
        text: 'The new interactive workshop on variable fonts starts tomorrow at 6 PM UTC! Looking forward to seeing you there.',
        time: 'Yesterday 4:00 PM',
        isRead: true,
      },
    ],
  }
];

const CANNED_CHEERS = [
  'Love your work! ❤️',
  'Thanks for the early access! 🔥',
  'Can\'t wait for the live stream! 🚀',
  'Amazing source files! 🎨',
  'Super helpful breakdown! 🙌'
];

const EMOJI_LIST = ['❤️', '🔥', '🎉', '👏', '🚀', '😍', '✨', '💎', '💯', '🙌'];

export function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>('conv-1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'vip' | 'unread' | 'online'>('all');
  
  // UI states
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'info'>('list');
  const [showCreatorInfo, setShowCreatorInfo] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  // References
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatPaneRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Scroll to bottom helper
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Switch conversation with realistic loader and GSAP reveal
  const handleSelectConversation = (convId: string) => {
    if (convId === activeConvId) {
      setMobileView('chat');
      return;
    }

    setActiveConvId(convId);
    setMobileView('chat');
    setIsChatLoading(true);
    setIsTyping(false);
    setReplyingTo(null);

    // Mark active conversation messages as read
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              unreadCount: 0,
              messages: c.messages.map((m) => ({ ...m, isRead: true })),
            }
          : c
      )
    );

    setTimeout(() => {
      setIsChatLoading(false);
      // Simulate occasional typing if online
      const target = conversations.find((c) => c.id === convId);
      if (target?.isOnline) {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 2000);
        }, 800);
      }
    }, 300);
  };

  // GSAP animation on chat change
  useEffect(() => {
    if (chatPaneRef.current && !prefersReducedMotion() && !isChatLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.chat-message-bubble',
          { opacity: 0, y: 12, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out' }
        );
      }, chatPaneRef);
      return () => ctx.revert();
    }
  }, [activeConvId, isChatLoading]);

  // Auto-scroll when messages change or typing toggles
  useEffect(() => {
    scrollToBottom(isChatLoading ? 'auto' : 'smooth');
  }, [activeConv?.messages.length, isTyping, isChatLoading]);

  // Send message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? messageInput).trim();
    if (!text || !activeConv) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text,
      time: 'Just now',
      isDelivered: true,
      isRead: false,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            sender: replyingTo.sender === 'me' ? 'You' : activeConv.name,
            text: replyingTo.text,
          }
        : undefined,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              lastMessage: text,
              time: 'Just now',
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    setMessageInput('');
    setReplyingTo(null);
    setShowEmojiPicker(false);

    // Realistic automated creator reaction or reply simulator
    if (activeConv.isOnline) {
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const replyText =
            text.includes('?') 
              ? `Great question! I\'ll cover this in depth in the next livestream demo.` 
              : `Thanks for the feedback Alex! Appreciate the support ❤️`;

          const creatorReply: ChatMessage = {
            id: `reply-${Date.now()}`,
            sender: 'other',
            text: replyText,
            time: 'Just now',
            isRead: true,
          };

          setConversations((latest) =>
            latest.map((c) =>
              c.id === activeConv.id
                ? {
                    ...c,
                    lastMessage: replyText,
                    time: 'Just now',
                    messages: [...c.messages, creatorReply],
                  }
                : c
            )
          );
        }, 2200);
      }, 1200);
    }
  };

  // Keydown handler (Enter to send, Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Unlock Paywalled Message
  const handleUnlockPaywall = (msgId: string, price: number) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === msgId ? { ...m, isUnlocked: true } : m
              ),
            }
          : c
      )
    );

    // Add confirmation tip/purchase receipt message
    const receiptMsg: ChatMessage = {
      id: `receipt-${Date.now()}`,
      sender: 'me',
      text: `Unlocked exclusive VIP attachment ($${price.toFixed(2)}) 🔓`,
      time: 'Just now',
      isRead: true,
      isDelivered: true,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              messages: [...c.messages, receiptMsg],
            }
          : c
      )
    );
  };

  // Send Tip Handler
  const handleTipSuccess = (amount: number, cheerMessage: string) => {
    if (!activeConv) return;
    const tipMsg: ChatMessage = {
      id: `tip-${Date.now()}`,
      sender: 'me',
      text: cheerMessage ? `Sent a $${amount.toFixed(2)} Tip! 🎁 "${cheerMessage}"` : `Sent a $${amount.toFixed(2)} Tip! 🎁`,
      time: 'Just now',
      isTip: true,
      tipAmount: amount,
      tipCheer: cheerMessage,
      isDelivered: true,
      isRead: true,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              lastMessage: `Sent $${amount.toFixed(2)} Tip 🎁`,
              time: 'Just now',
              messages: [...c.messages, tipMsg],
            }
          : c
      )
    );
  };

  // React with emoji
  const handleReact = (msgId: string, emoji: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id !== msgId) return m;
                const existing = m.reactions || [];
                const found = existing.find((r) => r.emoji === emoji);
                let updatedReactions;
                if (found) {
                  if (found.userReacted) {
                    updatedReactions = existing
                      .map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, userReacted: false } : r))
                      .filter((r) => r.count > 0);
                  } else {
                    updatedReactions = existing.map((r) =>
                      r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r
                    );
                  }
                } else {
                  updatedReactions = [...existing, { emoji, count: 1, userReacted: true }];
                }
                return { ...m, reactions: updatedReactions };
              }),
            }
          : c
      )
    );
  };

  // Filtered conversation list
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'vip') return c.isVip;
    if (filterTab === 'unread') return c.unreadCount > 0;
    if (filterTab === 'online') return c.isOnline;
    return true;
  });

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <MainLayout maxWidthClass="max-w-7xl">
      {/* Outer Card Container */}
      <div className="bg-white dark:bg-[#150D1E] rounded-3xl border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-sm h-[calc(100vh-8.5rem)] min-h-[580px] flex overflow-hidden relative">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Conversation Directory                                       */}
        {/* ========================================================================= */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-[#F3DCE8] dark:border-[#3A2A4C] flex flex-col bg-white dark:bg-[#150D1E] shrink-0 ${
            mobileView === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-[#F3DCE8] dark:border-[#3A2A4C] space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white shadow-xs">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h1 className="font-black text-sm text-[#18181B] dark:text-[#FDF2F8]">
                    Direct Messages
                  </h1>
                  <p className="text-[10px] text-[#71717A] dark:text-[#D4B8D0] font-medium">
                    1-on-1 fan chats & VIP drops
                  </p>
                </div>
              </div>

              {totalUnread > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-[#BE185D] dark:text-[#F472B6] text-[10px] font-black animate-pulse">
                  {totalUnread} New
                </span>
              )}
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl pl-8 pr-8 py-2 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:border-[var(--color-primary)] transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8]"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              {[
                { id: 'all', label: 'All', count: conversations.length },
                { id: 'vip', label: '⭐ VIP', count: conversations.filter((c) => c.isVip).length },
                { id: 'unread', label: '✉️ Unread', count: totalUnread },
                { id: 'online', label: '🟢 Online', count: conversations.filter((c) => c.isOnline).length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as any)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                    filterTab === tab.id
                      ? 'bg-[var(--color-soft-primary)] dark:bg-[#381A2B] text-[var(--color-primary)] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] shadow-2xs'
                      : 'text-[#71717A] dark:text-[#D4B8D0] hover:bg-[#FFF9FC] dark:hover:bg-[#22152E]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="text-[9px] opacity-75 font-black">({tab.count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List Feed */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-[#FFF1F7] dark:bg-[#2D162B] border-[#FBCFE8] dark:border-[#4C1D3B] shadow-xs scale-[0.99]'
                        : 'border-transparent hover:bg-[#FFF9FC] dark:hover:bg-[#22152E]/70'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        alt={conv.name}
                        src={conv.avatar}
                        size="md"
                        isVerified={conv.isVerified}
                        isOnline={conv.isOnline}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="font-bold text-xs text-[#18181B] dark:text-[#FDF2F8] truncate">
                            {conv.name}
                          </h4>
                          {conv.isVip && (
                            <span className="px-1.5 py-0.2 rounded-full bg-pink-100 dark:bg-pink-950/60 text-[#BE185D] dark:text-[#F472B6] text-[8px] font-black uppercase shrink-0">
                              VIP
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#A1A1AA] shrink-0 font-medium">{conv.time}</span>
                      </div>

                      <p className={`text-[11px] truncate mt-0.5 ${
                        conv.unreadCount > 0
                          ? 'font-bold text-[#18181B] dark:text-[#FDF2F8]'
                          : 'text-[#71717A] dark:text-[#D4B8D0]'
                      }`}>
                        {conv.lastMessage}
                      </p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[var(--color-primary)] text-white text-[9px] font-black flex items-center justify-center shrink-0 shadow-xs">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2">
                <Search size={24} className="mx-auto text-[#A1A1AA]" />
                <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">No chats found</p>
                <p className="text-[10px] text-[#71717A] dark:text-[#D4B8D0]">
                  Try searching for a different creator or switch filters.
                </p>
              </div>
            )}
          </div>

          {/* Quick Discover Footer */}
          <div className="p-3 border-t border-[#F3DCE8] dark:border-[#3A2A4C] bg-[#FFF9FC] dark:bg-[#1A1024] shrink-0">
            <Link
              href="/explore"
              className="w-full py-2 px-3 rounded-2xl bg-white dark:bg-[#241530] border border-[#F3DCE8] dark:border-[#3A2A4C] text-[11px] font-bold text-[var(--color-primary)] hover:bg-[#FFF1F7] dark:hover:bg-[#321B42] flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            >
              <Compass size={13} />
              <span>Explore New Creators</span>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER COLUMN: Active Chat Pane                                           */}
        {/* ========================================================================= */}
        <div
          ref={chatPaneRef}
          className={`flex-1 flex flex-col justify-between bg-[#FFF9FC] dark:bg-[#0E0716] min-w-0 ${
            mobileView === 'chat' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Top Chat Header Bar */}
              <div className="p-3.5 px-4 bg-white dark:bg-[#150D1E] border-b border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between shadow-2xs shrink-0 z-10">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1.5 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#2D162B] text-[#71717A] dark:text-[#D4B8D0] shrink-0 cursor-pointer"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="relative">
                    <Avatar
                      alt={activeConv.name}
                      src={activeConv.avatar}
                      size="sm"
                      isVerified={activeConv.isVerified}
                      isOnline={activeConv.isOnline}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-black text-xs sm:text-sm text-[#18181B] dark:text-[#FDF2F8] truncate">
                        {activeConv.name}
                      </h2>
                      {activeConv.isVip && (
                        <span className="text-[9px] font-black uppercase text-[#BE185D] dark:text-[#F472B6] bg-[#FFF1F7] dark:bg-[#2D162B] px-1.5 py-0.5 rounded-full border border-[#FBCFE8] dark:border-[#4C1D3B] shrink-0">
                          VIP Pass
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#71717A] dark:text-[#D4B8D0] font-medium">
                      <span>@{activeConv.username}</span>
                      <span>•</span>
                      <span className={activeConv.isOnline ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[#A1A1AA]'}>
                        {activeConv.lastActive}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header Action Tools */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsTipModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-xs font-black flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-all cursor-pointer"
                  >
                    <Gift size={13} />
                    <span className="hidden sm:inline">Send Tip</span>
                  </button>

                  <Link
                    href={`/c/${activeConv.username}`}
                    className="p-2 rounded-xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:bg-[#FFF1F7] dark:hover:bg-[#2D162B] text-[#71717A] dark:text-[#D4B8D0] transition-colors"
                    title="View Profile & VIP Drops"
                  >
                    <Sparkles size={15} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 768) {
                        setMobileView('info');
                      } else {
                        setShowCreatorInfo(!showCreatorInfo);
                      }
                    }}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      showCreatorInfo
                        ? 'bg-[var(--color-soft-primary)] dark:bg-[#381A2B] text-[var(--color-primary)] border-[#FBCFE8] dark:border-[#4C1D3B]'
                        : 'bg-[#FFF9FC] dark:bg-[#22152E] border-[#F3DCE8] dark:border-[#3A2A4C] text-[#71717A] dark:text-[#D4B8D0] hover:bg-[#FFF1F7]'
                    }`}
                    title="Toggle Creator Info"
                  >
                    <Info size={15} />
                  </button>
                </div>
              </div>

              {/* Chat Scroll Feed */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin"
              >
                {isChatLoading ? (
                  // Shimmer loaders
                  <div className="space-y-4 py-4">
                    <div className="flex gap-2.5 max-w-[70%]">
                      <div className="w-8 h-8 rounded-full skeleton-shimmer shrink-0" />
                      <div className="w-48 h-12 skeleton-shimmer rounded-2xl rounded-tl-none" />
                    </div>
                    <div className="flex gap-2.5 max-w-[70%] ml-auto flex-row-reverse">
                      <div className="w-8 h-8 rounded-full skeleton-shimmer shrink-0" />
                      <div className="w-56 h-10 skeleton-shimmer rounded-2xl rounded-tr-none" />
                    </div>
                    <div className="flex gap-2.5 max-w-[70%]">
                      <div className="w-8 h-8 rounded-full skeleton-shimmer shrink-0" />
                      <div className="w-64 h-24 skeleton-shimmer rounded-2xl rounded-tl-none" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Welcome / Encryption Header */}
                    <div className="text-center py-2 space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] text-[10px] text-[#71717A] dark:text-[#D4B8D0] shadow-2xs font-medium">
                        <ShieldCheck size={12} className="text-emerald-500" />
                        <span>Direct 1-on-1 Encrypted Messaging with {activeConv.name}</span>
                      </div>
                    </div>

                    {/* Messages Mapping */}
                    {activeConv.messages.map((msg) => {
                      const isMe = msg.sender === 'me';
                      return (
                        <div
                          key={msg.id}
                          className={`chat-message-bubble flex flex-col group ${
                            isMe ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div className={`flex items-end gap-2 max-w-[88%] sm:max-w-[75%] ${isMe ? 'flex-row-reverse' : ''}`}>
                            {!isMe && (
                              <Avatar
                                alt={activeConv.name}
                                src={activeConv.avatar}
                                size="xs"
                                className="mb-1 shrink-0"
                              />
                            )}

                            <div className="space-y-1 min-w-0">
                              {/* Replying snippet preview */}
                              {msg.replyTo && (
                                <div className={`text-[10px] px-3 py-1.5 rounded-xl border mb-1 truncate ${
                                  isMe
                                    ? 'bg-white/20 border-white/30 text-white/90'
                                    : 'bg-[#FFF1F7] dark:bg-[#22152E] border-[#F3DCE8] dark:border-[#3A2A4C] text-[#71717A] dark:text-[#D4B8D0]'
                                }`}>
                                  <span className="font-bold">Replying to {msg.replyTo.sender}:</span> {msg.replyTo.text}
                                </div>
                              )}

                              {/* Tip Event Message Card */}
                              {msg.isTip ? (
                                <div className="p-4 rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white shadow-md space-y-2 border border-white/20">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-1.5 text-xs font-black">
                                      <PartyPopper size={16} className="text-yellow-200" />
                                      <span>Creator Tip Sent!</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-white/25 text-white font-black text-xs backdrop-blur-xs">
                                      ${msg.tipAmount?.toFixed(2)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-white/95 leading-relaxed font-semibold">
                                    {msg.text}
                                  </p>
                                </div>
                              ) : msg.isAudio ? (
                                /* Audio Voice Note Bubble */
                                <div
                                  className={`p-3.5 px-4 rounded-2xl text-xs space-y-2 border shadow-xs ${
                                    isMe
                                      ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white rounded-br-xs border-transparent'
                                      : 'bg-white dark:bg-[#150D1E] border-[#F3DCE8] dark:border-[#3A2A4C] text-[#18181B] dark:text-[#FDF2F8] rounded-bl-xs'
                                  }`}
                                >
                                  <p className="font-semibold text-xs">{msg.text}</p>
                                  <div className="flex items-center gap-3 pt-1">
                                    <button
                                      onClick={() =>
                                        setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)
                                      }
                                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                        isMe
                                          ? 'bg-white text-[var(--color-primary)]'
                                          : 'bg-[var(--color-primary)] text-white'
                                      }`}
                                    >
                                      {playingAudioId === msg.id ? (
                                        <Pause size={14} />
                                      ) : (
                                        <Play size={14} className="ml-0.5" />
                                      )}
                                    </button>

                                    {/* Simulated Audio Waveform */}
                                    <div className="flex items-center gap-0.5 flex-1 h-5">
                                      {[40, 75, 55, 90, 30, 85, 60, 45, 95, 70, 50, 80, 65, 40, 90, 60].map(
                                        (height, i) => (
                                          <div
                                            key={i}
                                            style={{ height: `${height}%` }}
                                            className={`w-1 rounded-full transition-all ${
                                              isMe
                                                ? 'bg-white/70'
                                                : playingAudioId === msg.id
                                                ? 'bg-[var(--color-primary)]'
                                                : 'bg-slate-300 dark:bg-slate-600'
                                            } ${playingAudioId === msg.id ? 'animate-pulse' : ''}`}
                                          />
                                        )
                                      )}
                                    </div>

                                    <span className={`text-[10px] font-mono font-bold ${isMe ? 'text-white/80' : 'text-[#A1A1AA]'}`}>
                                      {msg.audioDuration || '0:30'}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                /* Standard Text & Paywalled Content Bubble */
                                <div
                                  className={`p-3.5 px-4 rounded-2xl text-xs leading-relaxed font-semibold shadow-xs ${
                                    isMe
                                      ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white rounded-br-xs'
                                      : 'bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] text-[#18181B] dark:text-[#FDF2F8] rounded-bl-xs'
                                  }`}
                                >
                                  <p>{msg.text}</p>

                                  {/* Paywalled Attachment Card */}
                                  {msg.isPaywalled && (
                                    <div className="mt-3 p-3.5 bg-[#FFF9FC] dark:bg-[#22152E] rounded-2xl border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-3">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 text-xs font-black text-[#BE185D] dark:text-[#F472B6]">
                                          <Lock size={14} />
                                          <span>VIP Exclusive Attachment</span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950 text-[#BE185D] dark:text-[#F472B6] text-[10px] font-black">
                                          ${msg.unlockPrice?.toFixed(2)}
                                        </span>
                                      </div>

                                      {msg.isUnlocked ? (
                                        <div className="space-y-2">
                                          <div className="relative group/media overflow-hidden rounded-xl">
                                            <img
                                              src={msg.mediaUrl}
                                              alt="Unlocked Drop Asset"
                                              className="w-full h-44 object-cover cursor-pointer hover:scale-105 transition-transform"
                                              onClick={() => setLightboxImage(msg.mediaUrl || null)}
                                            />
                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                                              <span className="text-xs font-bold bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                                                Click to expand
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                            <span className="flex items-center gap-1">
                                              <Check size={12} />
                                              <span>Unlocked with VIP membership</span>
                                            </span>
                                            <a
                                              href={msg.mediaUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="hover:underline flex items-center gap-1"
                                            >
                                              <Download size={11} />
                                              <span>Download</span>
                                            </a>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-2.5 text-center py-1">
                                          <div className="relative rounded-xl overflow-hidden h-28 flex items-center justify-center">
                                            {msg.mediaUrl && (
                                              <img
                                                src={msg.mediaUrl}
                                                alt="Locked blur"
                                                className="absolute inset-0 w-full h-full object-cover blur-md opacity-60 scale-110"
                                              />
                                            )}
                                            <div className="relative z-10 p-2 rounded-full bg-black/50 text-white backdrop-blur-md">
                                              <Lock size={20} />
                                            </div>
                                          </div>
                                          <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] font-medium">
                                            Unlock complete 4K source files and procedural assets.
                                          </p>
                                          <Button
                                            variant="primary"
                                            size="sm"
                                            className="w-full text-xs font-black cursor-pointer"
                                            onClick={() => handleUnlockPaywall(msg.id, msg.unlockPrice || 5.0)}
                                          >
                                            <Unlock size={13} className="mr-1.5" />
                                            <span>Unlock File (${msg.unlockPrice?.toFixed(2)})</span>
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Reactions Pills */}
                              {msg.reactions && msg.reactions.length > 0 && (
                                <div className="flex items-center gap-1 pt-0.5">
                                  {msg.reactions.map((r, i) => (
                                    <button
                                      key={i}
                                      onClick={() => handleReact(msg.id, r.emoji)}
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                                        r.userReacted
                                          ? 'bg-[var(--color-soft-primary)] dark:bg-[#381A2B] text-[var(--color-primary)] border-[#FBCFE8] dark:border-[#4C1D3B]'
                                          : 'bg-white dark:bg-[#150D1E] text-[#71717A] dark:text-[#D4B8D0] border-[#F3DCE8] dark:border-[#3A2A4C]'
                                      }`}
                                    >
                                      <span>{r.emoji}</span>
                                      <span>{r.count}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Message Metadata & Hover Actions */}
                          <div className={`flex items-center gap-2 mt-1 px-1 text-[9px] text-[#A1A1AA] ${isMe ? 'flex-row-reverse' : ''}`}>
                            <span>{msg.time}</span>
                            {isMe && (
                              <span className="flex items-center">
                                {msg.isRead ? (
                                  <CheckCheck size={13} className="text-[var(--color-primary)]" />
                                ) : msg.isDelivered ? (
                                  <CheckCheck size={13} className="text-[#A1A1AA]" />
                                ) : (
                                  <Check size={13} className="text-[#A1A1AA]" />
                                )}
                              </span>
                            )}

                            {/* Quick Hover Reactions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-[#22152E] px-1.5 py-0.5 rounded-full border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xs">
                              {['❤️', '🔥', '👏'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReact(msg.id, emoji)}
                                  className="hover:scale-125 transition-transform cursor-pointer text-xs"
                                >
                                  {emoji}
                                </button>
                              ))}
                              <button
                                onClick={() => setReplyingTo(msg)}
                                className="text-[9px] font-bold text-[var(--color-primary)] hover:underline ml-1 cursor-pointer"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing Indicator Bubble */}
                    {isTyping && (
                      <div className="flex items-center gap-2.5 max-w-[80%]">
                        <Avatar
                          alt={activeConv.name}
                          src={activeConv.avatar}
                          size="xs"
                        />
                        <div className="bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[10px] text-[#A1A1AA] italic">
                          {activeConv.name} is typing...
                        </span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Bottom Quick Cheers & Input Area */}
              <div className="p-3 sm:p-4 bg-white dark:bg-[#150D1E] border-t border-[#F3DCE8] dark:border-[#3A2A4C] space-y-2.5 shrink-0">
                
                {/* Replying Banner */}
                {replyingTo && (
                  <div className="flex items-center justify-between p-2 px-3 rounded-xl bg-[#FFF1F7] dark:bg-[#22152E] border border-[#FBCFE8] dark:border-[#4C1D3B] text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[var(--color-primary)] font-bold">Replying to {replyingTo.sender === 'me' ? 'Yourself' : activeConv.name}:</span>
                      <span className="text-[#71717A] dark:text-[#D4B8D0] truncate">{replyingTo.text}</span>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Canned Quick Cheers Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  <span className="text-[10px] text-[#A1A1AA] font-bold shrink-0 hidden sm:inline">Quick reply:</span>
                  {CANNED_CHEERS.map((cheer, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(cheer)}
                      className="px-2.5 py-1 rounded-full bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[var(--color-primary)] text-[10px] font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-[var(--color-primary)] whitespace-nowrap transition-all cursor-pointer shadow-2xs shrink-0"
                    >
                      {cheer}
                    </button>
                  ))}
                </div>

                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                  <div className="p-2 bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-2xl flex items-center gap-2 shadow-sm">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setMessageInput((prev) => prev + emoji);
                          setShowEmojiPicker(false);
                          inputRef.current?.focus();
                        }}
                        className="text-lg hover:scale-125 transition-transform cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 rounded-xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] text-[#71717A] dark:text-[#D4B8D0] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                      title="Insert Emoji"
                    >
                      <Smile size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsTipModalOpen(true)}
                      className="p-2 rounded-xl bg-[#FFF1F7] dark:bg-[#2D162B] border border-[#FBCFE8] dark:border-[#4C1D3B] text-[var(--color-primary)] hover:bg-[#FCE7F3] transition-colors cursor-pointer"
                      title="Send Tip to Creator"
                    >
                      <Gift size={16} />
                    </button>
                  </div>

                  {/* Input TextArea */}
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Write a message to ${activeConv.name}...`}
                    className="flex-1 bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] focus:border-[var(--color-primary)] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none resize-none font-medium transition-all max-h-24"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="p-2.5 sm:px-4 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white hover:opacity-95 transition-all disabled:opacity-40 cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Send size={15} />
                    <span className="text-xs font-bold hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div className="space-y-3 max-w-sm">
                <div className="w-14 h-14 rounded-3xl bg-[var(--color-soft-primary)] dark:bg-[#2D162B] border border-[#FBCFE8] dark:border-[#4C1D3B] flex items-center justify-center mx-auto text-[var(--color-primary)] shadow-sm">
                  <MessageSquare size={24} />
                </div>
                <h3 className="font-extrabold text-base text-[#18181B] dark:text-[#FDF2F8]">
                  Select a creator conversation
                </h3>
                <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] leading-relaxed">
                  Directly chat with your favorite creators, unlock VIP masterclass assets, and receive exclusive drops.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Creator Info & Shared Media Sidebar                          */}
        {/* ========================================================================= */}
        {activeConv && (
          <div
            className={`w-80 border-l border-[#F3DCE8] dark:border-[#3A2A4C] bg-white dark:bg-[#150D1E] flex flex-col shrink-0 overflow-y-auto ${
              mobileView === 'info'
                ? 'absolute inset-0 z-30 flex'
                : showCreatorInfo
                ? 'hidden lg:flex'
                : 'hidden'
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-wider text-[#71717A] dark:text-[#D4B8D0]">
                Creator Details
              </h3>
              <button
                onClick={() => {
                  setShowCreatorInfo(false);
                  if (mobileView === 'info') setMobileView('chat');
                }}
                className="p-1 rounded-lg hover:bg-[#FFF9FC] dark:hover:bg-[#22152E] text-[#71717A]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Hero in Drawer */}
            <div className="p-5 text-center space-y-3 border-b border-[#F3DCE8] dark:border-[#3A2A4C]">
              <Avatar
                alt={activeConv.name}
                src={activeConv.avatar}
                size="lg"
                isVerified={activeConv.isVerified}
                isOnline={activeConv.isOnline}
                className="mx-auto shadow-sm"
              />
              <div>
                <h4 className="font-black text-sm text-[#18181B] dark:text-[#FDF2F8]">
                  {activeConv.name}
                </h4>
                <p className="text-xs text-[var(--color-primary)] font-bold">
                  @{activeConv.username}
                </p>
              </div>
              <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] leading-relaxed font-medium">
                {activeConv.bio || 'Creator on CreatorPulse'}
              </p>

              <div className="flex items-center justify-center gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsTipModalOpen(true)}
                  className="text-xs font-black cursor-pointer"
                >
                  <Gift size={13} className="mr-1" />
                  <span>Send Tip</span>
                </Button>
                <Link href={`/c/${activeConv.username}`}>
                  <Button variant="outline" size="sm" className="text-xs font-bold">
                    <ExternalLink size={13} className="mr-1" />
                    <span>Profile</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Active Subscription Tier Status */}
            {activeConv.isVip && (
              <div className="p-4 border-b border-[#F3DCE8] dark:border-[#3A2A4C] space-y-2 bg-[#FFF9FC] dark:bg-[#1A1024]">
                <div className="flex items-center gap-1.5 text-xs font-black text-[var(--color-primary)]">
                  <Star size={14} />
                  <span>Active Membership Pass</span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                    <span>{activeConv.tierName || 'VIP Tier'}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">● Active</span>
                  </div>
                  <p className="text-[10px] text-[#71717A] dark:text-[#D4B8D0]">
                    Direct messaging perks, exclusive drop discounts, and HD file downloads included.
                  </p>
                </div>
              </div>
            )}

            {/* Shared Media Gallery */}
            <div className="p-4 space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                  Shared Media & Attachments
                </span>
                <span className="text-[10px] text-[#A1A1AA] font-bold">
                  {activeConv.sharedMedia?.length || 0} Files
                </span>
              </div>

              {activeConv.sharedMedia && activeConv.sharedMedia.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {activeConv.sharedMedia.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setLightboxImage(img)}
                      className="aspect-square rounded-xl overflow-hidden border border-[#F3DCE8] dark:border-[#3A2A4C] cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img src={img} alt="Shared thumbnail" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] italic text-center py-4">
                  No shared files yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
            <img src={lightboxImage} alt="Expanded preview" className="w-full h-auto object-contain max-h-[85vh]" />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Tip Modal */}
      {activeConv && (
        <TipModal
          isOpen={isTipModalOpen}
          onClose={() => setIsTipModalOpen(false)}
          creatorName={activeConv.name}
          creatorHandle={activeConv.username}
          creatorAvatar={activeConv.avatar}
          onSuccess={handleTipSuccess}
        />
      )}
    </MainLayout>
  );
}

export default MessagesPage;
