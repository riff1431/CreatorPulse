'use client';

import React from 'react';
import { 
  Sparkles, Compass, Radio, Heart, Gift, 
  ArrowRight, X, Play, ShieldCheck, Zap, Lock
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { markWelcomeSeen } from '@/lib/ftue/ftue-store';
import { Button } from './Button';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onStartTour,
}) => {
  const { user } = useAuth();
  const isCreator = user?.role === 'creator';

  if (!isOpen || !user) return null;

  const handleDismiss = () => {
    if (user.id) {
      markWelcomeSeen(user.id);
    }
    onClose();
  };

  const handleStartTourClick = () => {
    if (user.id) {
      markWelcomeSeen(user.id);
    }
    onStartTour();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300"
      onClick={handleDismiss}
    >
      <div
        className="relative max-w-lg w-full bg-white dark:bg-[#150D1E] rounded-[36px] p-6 sm:p-8 border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl space-y-6 animate-in zoom-in-95 duration-400"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Badge & Close Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF8A00] via-[#EC4899] to-[#7928CA] flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Sparkles size={18} />
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-pink-100 text-[#EC4899] dark:bg-pink-950/60 dark:text-pink-400 tracking-wider">
              {isCreator ? 'Creator Welcome' : 'Community Welcome'}
            </span>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-1.5 text-center sm:text-left">
          <h2 className="text-2xl font-black text-[#18181B] dark:text-[#FDF2F8] tracking-tight">
            Welcome to CreatorPulse, {user.fullName?.split(' ')[0] || 'Friend'}! 🎉
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] font-medium leading-relaxed">
            {isCreator
              ? 'Your creator channel is ready. Start publishing exclusive drops, hosting live rooms, and building your membership community.'
              : 'You are now connected to top creators, 24h stories, exclusive VIP drops, and direct interactions.'}
          </p>
        </div>

        {/* 3 Key Feature Highlights */}
        <div className="space-y-2.5">
          {isCreator ? (
            <>
              <div className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/40 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <Zap size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                    VIP Drops & Paywalls
                  </p>
                  <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">
                    Charge per view on exclusive video tutorials, audio notes, or PSDs.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Radio size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                    Interactive Live Rooms
                  </p>
                  <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">
                    Broadcast in real time and collect party tips, gifts, and super chats.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                    Weekly Automated Payouts
                  </p>
                  <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">
                    Keep 95% of your earnings deposited directly to Stripe, Bank, or Crypto.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/40 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <Play size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                    24-Hour Stories & Reels
                  </p>
                  <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">
                    Watch behind-the-scenes content and join interactive live stream broadcasts.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Heart size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                    Tip & Cheer Your Favorites
                  </p>
                  <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">
                    Send one-tap creator tips and unlock custom VIP badges in chat.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Lock size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
                    Unlock Exclusive Drops
                  </p>
                  <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">
                    Get instant access to masterclasses, project source files, and VIP drops.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleStartTourClick}
            className="w-full sm:flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white text-xs font-black shadow-lg shadow-pink-500/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles size={16} />
            <span>Start 1-Minute Tour</span>
          </button>

          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-[#F3DCE8] dark:border-[#3A2A4C] text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:bg-[#FFF1F7] dark:hover:bg-[#22152E] transition-colors cursor-pointer"
          >
            Explore On My Own
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
