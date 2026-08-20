'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, Send, Search, X, Sparkles, 
  ArrowLeft, Check, CheckCheck, Smile, Flame, 
  ArrowRight, ShieldCheck, Heart, Paperclip, 
  ExternalLink, UserCheck, Play, Lock
} from 'lucide-react';
import { Avatar } from './Avatar';

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
  isRead?: boolean;
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
  lastMessage: string;
  time: string;
  unreadCount: number;
  messages: ChatMessage[];
}

const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Sarah Jenkins',
    username: 'sarahdesign',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    isVerified: true,
    isVip: true,
    isOnline: true,
    lastActive: 'Active now',
    lastMessage: 'Here is the 4K procedural shader source file for VIP members! 🎨',
    time: '3m ago',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        sender: 'other',
        text: 'Hey Alex! Welcome to the VIP Pro Designer community! So glad to have you here 🎉',
        time: '10:30 AM',
        isRead: true,
      },
      {
        id: 'm2',
        sender: 'me',
        text: 'Thank you Sarah! Loving the latest 3D render breakdown and project assets. The lighting setup is incredible!',
        time: '10:32 AM',
        isRead: true,
      },
      {
        id: 'm3',
        sender: 'other',
        text: 'Here is the 4K procedural shader source file for VIP members! 🎨 Let me know what you think.',
        time: '3m ago',
        isRead: false,
      },
    ],
  },
  {
    id: 'conv-2',
    name: 'Marcus Vance',
    username: 'marcuscode',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    isVerified: true,
    isVip: false,
    isOnline: true,
    lastActive: 'Active now',
    lastMessage: 'Going LIVE in 15 mins for the Next.js 15 deep-dive session!',
    time: '18m ago',
    unreadCount: 2,
    messages: [
      {
        id: 'm201',
        sender: 'other',
        text: 'Hey! Are you joining our live architecture stream today?',
        time: '11:00 AM',
        isRead: true,
      },
      {
        id: 'm202',
        sender: 'other',
        text: 'Going LIVE in 15 mins for the Next.js 15 deep-dive session!',
        time: '18m ago',
        isRead: false,
      },
    ],
  },
  {
    id: 'conv-3',
    name: 'Elena Rostova',
    username: 'elenadesign',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    isVerified: true,
    isVip: true,
    isOnline: false,
    lastActive: '2h ago',
    lastMessage: 'Appreciate the feedback on the variable font system!',
    time: '2h ago',
    unreadCount: 0,
    messages: [
      {
        id: 'm301',
        sender: 'me',
        text: 'Elena, your variable font pairing guide is incredible! Shared it with my design team.',
        time: 'Yesterday',
        isRead: true,
      },
      {
        id: 'm302',
        sender: 'other',
        text: 'Appreciate the feedback on the variable font system! Enjoy creating! ✨',
        time: '2h ago',
        isRead: true,
      },
    ],
  },
  {
    id: 'conv-4',
    name: 'David Kim',
    username: 'davidbeats',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isVerified: false,
    isVip: false,
    isOnline: false,
    lastActive: '1d ago',
    lastMessage: 'Check out the new Lo-Fi sample pack on my creator hub 🎧',
    time: '1d ago',
    unreadCount: 0,
    messages: [
      {
        id: 'm401',
        sender: 'other',
        text: 'Check out the new Lo-Fi sample pack on my creator hub 🎧',
        time: '1d ago',
        isRead: true,
      },
    ],
  },
];

export const MESSAGES_STORAGE_KEY = 'creatorpulse_fan_conversations';

export const getStoredMessagesUnreadCount = (): number => {
  if (typeof window === 'undefined') return 3;
  const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
  if (stored) {
    try {
      const convs: Conversation[] = JSON.parse(stored);
      return convs.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
    } catch {
      return DEFAULT_CONVERSATIONS.reduce((acc, c) => acc + c.unreadCount, 0);
    }
  }
  return DEFAULT_CONVERSATIONS.reduce((acc, c) => acc + c.unreadCount, 0);
};

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const MessagesModal: React.FC<MessagesModalProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Load from localStorage or defaults
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
      let items = DEFAULT_CONVERSATIONS;
      if (stored) {
        try {
          items = JSON.parse(stored);
        } catch {
          items = DEFAULT_CONVERSATIONS;
        }
      }
      setConversations(items);
      const totalUnread = items.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
      onUnreadCountChange?.(totalUnread);
    }
  }, [isOpen, onUnreadCountChange]);

  // Sync to storage and notify listeners
  const syncStorage = (updated: Conversation[]) => {
    setConversations(updated);
    const totalUnread = updated.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
    if (typeof window !== 'undefined') {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('creatorpulse_messages_updated', {
          detail: { unreadCount: totalUnread },
        })
      );
    }
    onUnreadCountChange?.(totalUnread);
  };

  // Scroll to bottom when conversation or message changes
  useEffect(() => {
    if (selectedConvId && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConvId, conversations]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedConvId) {
          setSelectedConvId(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, selectedConvId, onClose]);

  if (!isOpen) return null;

  const totalUnreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  const handleSelectConversation = (id: string) => {
    setSelectedConvId(id);
    // Mark messages as read
    const updated = conversations.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          unreadCount: 0,
          messages: c.messages.map((m) => ({ ...m, isRead: true })),
        };
      }
      return c;
    });
    syncStorage(updated);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConvId) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: replyText.trim(),
      time: 'Just now',
      isRead: true,
    };

    const updated = conversations.map((c) => {
      if (c.id === selectedConvId) {
        return {
          ...c,
          lastMessage: newMsg.text,
          time: 'Just now',
          messages: [...c.messages, newMsg],
        };
      }
      return c;
    });

    syncStorage(updated);
    setReplyText('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md transition-opacity duration-200 animate-in fade-in select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="messages-modal-title"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg md:max-w-xl bg-white dark:bg-[#150D1E] rounded-t-[28px] sm:rounded-[32px] border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-[620px] max-h-[92vh] animate-in zoom-in-95 slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200"
      >
        {/* Mobile top drag indicator handle */}
        <div className="sm:hidden w-10 h-1.5 bg-[#E4E4E7] dark:bg-[#3A2A4C] rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-between shrink-0 bg-white/60 dark:bg-[#150D1E]/60 backdrop-blur-md gap-2">
          {selectedConv ? (
            /* Header when chatting */
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setSelectedConvId(null)}
                className="p-1.5 sm:p-2 rounded-xl bg-[#F4F4F6] dark:bg-[#22152E] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#E4E4E7] dark:hover:bg-[#2E1D3E] transition-all cursor-pointer shrink-0"
                title="Back to conversations list"
              >
                <ArrowLeft size={16} />
              </button>

              <div className="relative shrink-0">
                <Avatar src={selectedConv.avatar} alt={selectedConv.name} size="sm" />
                {selectedConv.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white dark:ring-[#150D1E]" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-[#18181B] dark:text-[#FDF2F8] truncate">
                    {selectedConv.name}
                  </h3>
                  {selectedConv.isVerified && (
                    <ShieldCheck size={13} className="text-[#EC4899] shrink-0" />
                  )}
                  {selectedConv.isVip && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white shrink-0">
                      VIP
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#10B981] block truncate">
                  {selectedConv.isOnline ? 'Active now' : selectedConv.lastActive}
                </span>
              </div>
            </div>
          ) : (
            /* Header when browsing list */
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#FF8A00] via-[#EC4899] to-[#7928CA] flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
                <MessageSquare size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h3 id="messages-modal-title" className="text-sm sm:text-base md:text-lg font-black text-[#18181B] dark:text-[#FDF2F8] truncate">
                    Direct Messages
                  </h3>
                  {totalUnreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black bg-pink-100 dark:bg-[#381A2B] text-[#EC4899] dark:text-[#F472B6] shrink-0">
                      {totalUnreadCount} Unread
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-[#71717A] dark:text-[#A1A1AA] truncate">
                  Chat with creators and community
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {selectedConv && (
              <Link
                href="/messages"
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl text-[11px] sm:text-xs font-bold text-[#EC4899] hover:bg-pink-50 dark:hover:bg-[#22152E] transition-all cursor-pointer hidden xs:flex items-center gap-1 shrink-0"
                title="Open full page inbox"
              >
                <span>Full Chat</span>
                <ExternalLink size={12} />
              </Link>
            )}

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[#F4F4F6] dark:bg-[#22152E] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-[#E4E4E7] dark:hover:bg-[#2E1D3E] transition-all cursor-pointer"
              aria-label="Close messages modal"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Modal Body: Either Conversation List or Active Chat */}
        {selectedConv ? (
          /* ========================================================================= */
          /* ACTIVE QUICK CHAT VIEW                                                    */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col min-h-0 bg-[#FFF9FC]/30 dark:bg-[#120B1A]/40">
            {/* Scrollable Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3">
              <div className="text-center py-1.5">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#A1A1AA] bg-white/80 dark:bg-[#22152E]/80 px-2.5 py-1 rounded-full border border-[#F3DCE8]/60 dark:border-[#3A2A4C]/60">
                  End-to-end encrypted VIP Direct Message
                </span>
              </div>

              {selectedConv.messages.map((msg) => {
                const isMe = msg.sender === 'me';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-1.5 sm:gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <Avatar
                        src={selectedConv.avatar}
                        alt={selectedConv.name}
                        size="xs"
                        className="mb-1 shrink-0"
                      />
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-2.5 sm:p-3.5 text-xs sm:text-[13px] leading-relaxed break-words ${
                        isMe
                          ? 'bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white rounded-br-xs shadow-md shadow-pink-500/10'
                          : 'bg-white dark:bg-[#1E1428] text-[#18181B] dark:text-[#FDF2F8] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      <p className="font-medium">{msg.text}</p>
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[9px] sm:text-[10px] ${
                          isMe ? 'text-white/75' : 'text-[#A1A1AA]'
                        }`}
                      >
                        <span>{msg.time}</span>
                        {isMe && <CheckCheck size={11} className="text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Reply Form with Mobile Safe Area Support */}
            <form
              onSubmit={handleSendMessage}
              className="p-2.5 sm:p-4 border-t border-[#F3DCE8] dark:border-[#3A2A4C] bg-white dark:bg-[#150D1E] flex items-center gap-2 shrink-0 pb-[max(env(safe-area-inset-bottom),0.625rem)]"
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Message ${selectedConv.name.split(' ')[0]}...`}
                className="flex-1 bg-[#F4F4F6] dark:bg-[#22152E] border border-transparent focus:border-[#EC4899] rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[13px] text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none transition-all font-medium min-w-0"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-[#FF8A00] to-[#E52E71] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-md shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                title="Send message"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        ) : (
          /* ========================================================================= */
          /* CONVERSATIONS LIST VIEW                                                   */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search conversations */}
            <div className="p-2.5 sm:p-3 md:px-5 border-b border-[#F3DCE8]/60 dark:border-[#3A2A4C]/60 bg-[#FFF9FC]/50 dark:bg-[#1A1222]/50 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats & creators..."
                  className="w-full bg-white dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] focus:border-[#EC4899] rounded-full pl-8 sm:pl-9 pr-7 py-1.5 sm:py-2 text-xs sm:text-[13px] text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#18181B]"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Conversation list items */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`group relative p-2.5 sm:p-3 md:p-3.5 rounded-2xl sm:rounded-3xl border transition-all duration-200 cursor-pointer flex items-center gap-2.5 sm:gap-3.5 ${
                      conv.unreadCount > 0
                        ? 'bg-[#FFF5F9] dark:bg-[#241731] border-[#FBCFE8] dark:border-[#522344] shadow-xs'
                        : 'bg-white dark:bg-[#1A1222] border-[#F3DCE8]/80 dark:border-[#3A2A4C]/80 hover:bg-[#FFF9FC] dark:hover:bg-[#22152E]'
                    }`}
                  >
                    {/* Avatar with status indicator */}
                    <div className="relative shrink-0">
                      <Avatar
                        src={conv.avatar}
                        alt={conv.name}
                        size="sm"
                        className="ring-2 ring-[#F3DCE8] dark:ring-[#3A2A4C]"
                      />
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white dark:ring-[#150D1E]" />
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                          <h4 className="text-xs sm:text-[13px] font-black text-[#18181B] dark:text-[#FDF2F8] truncate">
                            {conv.name}
                          </h4>
                          {conv.isVerified && (
                            <ShieldCheck size={12} className="text-[#EC4899] shrink-0" />
                          )}
                          {conv.isVip && (
                            <span className="text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-pink-100 dark:bg-[#381A2B] text-[#EC4899] dark:text-[#F472B6] shrink-0">
                              VIP
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-semibold text-[#A1A1AA] shrink-0">
                          {conv.time}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1.5">
                        <p className={`text-[11px] sm:text-xs truncate font-medium ${
                          conv.unreadCount > 0
                            ? 'text-[#18181B] dark:text-white font-bold'
                            : 'text-[#71717A] dark:text-[#A1A1AA]'
                        }`}>
                          {conv.lastMessage}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="px-1.5 sm:px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-black bg-[#EC4899] text-white shrink-0 shadow-xs">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 sm:py-12 px-4 text-center space-y-2.5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFF1F7] dark:bg-[#22152E] flex items-center justify-center text-[#EC4899] mx-auto">
                    <MessageSquare size={22} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs sm:text-sm text-[#18181B] dark:text-[#FDF2F8]">
                      No conversations found
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#71717A] dark:text-[#A1A1AA] max-w-xs mx-auto">
                      Search for creators or explore channels to start new direct conversations!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Safe Area Support on Mobile */}
            <div className="p-3 sm:p-4 md:px-5 border-t border-[#F3DCE8] dark:border-[#3A2A4C] bg-[#FFF9FC]/60 dark:bg-[#1A1222]/60 flex items-center justify-between shrink-0 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
              <Link
                href="/messages"
                onClick={onClose}
                className="text-[11px] sm:text-xs font-bold text-[#EC4899] hover:text-[#BE185D] dark:hover:text-[#F472B6] flex items-center gap-1 group cursor-pointer truncate"
              >
                <span>Open Full Messenger Inbox</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>

              <button
                onClick={onClose}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:bg-[#F4F4F6] dark:hover:bg-[#22152E] transition-colors cursor-pointer shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesModal;
