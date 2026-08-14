'use client';

import React from 'react';
import Link from 'next/link';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useAnnouncements } from '@/lib/notifications/announcement-context';
import { useAuth } from '@/lib/auth/auth-context';

export const AnnouncementBanner: React.FC = () => {
  const { getActiveBanners, dismissAnnouncement } = useAnnouncements();
  const { role } = useAuth();

  const activeBanners = getActiveBanners(role || 'guest');
  if (activeBanners.length === 0) return null;

  const current = activeBanners[0];

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 text-white text-xs py-2.5 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center shrink-0">
            <Sparkles size={12} />
          </span>
          <span className="font-bold truncate">{current.title}</span>
          <span className="hidden md:inline text-white/80 font-medium truncate">• {current.content}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {current.ctaText && current.ctaLink && (
            <Link href={current.ctaLink}>
              <span className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-lg font-bold transition-all text-[11px] flex items-center gap-1">
                {current.ctaText} <ArrowRight size={12} />
              </span>
            </Link>
          )}

          {current.isDismissible && (
            <button
              onClick={() => dismissAnnouncement(current.id)}
              className="text-white/70 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
