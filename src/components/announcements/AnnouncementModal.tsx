'use client';

import React from 'react';
import Link from 'next/link';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useAnnouncements } from '@/lib/notifications/announcement-context';
import { useAuth } from '@/lib/auth/auth-context';

export const AnnouncementModal: React.FC = () => {
  const { getActiveModals, dismissAnnouncement } = useAnnouncements();
  const { role } = useAuth();

  const activeModals = getActiveModals(role || 'guest');
  if (activeModals.length === 0) return null;

  const current = activeModals[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-pink-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => dismissAnnouncement(current.id)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-sm">
          <Sparkles size={24} />
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900 leading-tight">{current.title}</h3>
          <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">{current.content}</p>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          {current.ctaText && current.ctaLink ? (
            <Link href={current.ctaLink} onClick={() => dismissAnnouncement(current.id)} className="w-full">
              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer">
                {current.ctaText} <ArrowRight size={14} />
              </button>
            </Link>
          ) : (
            <button
              onClick={() => dismissAnnouncement(current.id)}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Got it, close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
