'use client';

import React, { useState } from 'react';
import { 
  X, Copy, Check, Share2, Send, 
  MessageCircle, Link2, Globe
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  url?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  title = 'Check out this creator drop on CreatorPulse!',
  url = typeof window !== 'undefined' ? window.location.href : 'https://creatorpulse.com'
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: 'X / Twitter',
      icon: Globe,
      color: 'bg-black text-white hover:bg-neutral-800',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-600 text-white hover:bg-emerald-700',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-sky-500 text-white hover:bg-sky-600',
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      name: 'Facebook',
      icon: Share2,
      color: 'bg-blue-600 text-white hover:bg-blue-700',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#150D1E] rounded-3xl border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#F3DCE8] dark:border-[#3A2A4C]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-[#EC4899]">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-[#18181B] dark:text-[#FDF2F8]">
                Share Drop
              </h3>
              <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">
                Share this post or creator with your friends
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-[#71717A] dark:text-[#D4B8D0] hover:text-[#18181B] dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Social Share Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {shareOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <a
                key={opt.name}
                href={opt.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-black shadow-xs ${opt.color}`}
              >
                <Icon size={18} />
                <span className="text-[11px]">{opt.name}</span>
              </a>
            );
          })}
        </div>

        {/* 1-Click Copy Link Bar */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase tracking-wider text-[#71717A] dark:text-[#D4B8D0]">
            Direct Link
          </label>
          <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C]">
            <Link2 size={15} className="text-[#A1A1AA] shrink-0" />
            <input 
              type="text" 
              readOnly 
              value={url} 
              className="flex-1 text-xs font-mono bg-transparent text-[#18181B] dark:text-[#FDF2F8] focus:outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-[#EC4899] text-white hover:bg-[#DB2777]'
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
