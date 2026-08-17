'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, CheckCircle2, ChevronRight, X, ArrowRight,
  Heart, MessageSquare, Compass, Wallet, PlusSquare,
  DollarSign, CreditCard, Share2, Award, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { getFtueState, completeFirstAction } from '@/lib/ftue/ftue-store';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  actionUrl: string;
  actionLabel: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

const FAN_ACTIONS: ActionItem[] = [
  {
    id: 'fan_action_like',
    title: 'Like your first post',
    description: 'Double-tap or click heart on any community post.',
    actionUrl: '/feed',
    actionLabel: 'Browse Feed',
    icon: Heart,
  },
  {
    id: 'fan_action_comment',
    title: 'Leave a comment',
    description: 'Share your thoughts or cheer a creator on their drop.',
    actionUrl: '/feed',
    actionLabel: 'Comment',
    icon: MessageSquare,
  },
  {
    id: 'fan_action_explore',
    title: 'Discover top creators',
    description: 'Find creators across Art, Tech, Music, and Photography.',
    actionUrl: '/explore',
    actionLabel: 'Explore',
    icon: Compass,
  },
  {
    id: 'fan_action_wallet',
    title: 'Check your member balance',
    description: 'View your available wallet funds for tips and VIP unlocks.',
    actionUrl: '/balance',
    actionLabel: 'View Wallet',
    icon: Wallet,
  },
];

const CREATOR_ACTIONS: ActionItem[] = [
  {
    id: 'creator_action_post',
    title: 'Publish your first post',
    description: 'Upload a photo, video lesson, or story announcement.',
    actionUrl: '/feed',
    actionLabel: 'Create Post',
    icon: PlusSquare,
  },
  {
    id: 'creator_action_price',
    title: 'Review membership pricing',
    description: 'Customize your monthly subscription tier rate.',
    actionUrl: '/creator/dashboard',
    actionLabel: 'Set Pricing',
    icon: DollarSign,
  },
  {
    id: 'creator_action_payout',
    title: 'Set up payout banking',
    description: 'Connect Stripe, Bank, or Crypto for earnings payout.',
    actionUrl: '/balance',
    actionLabel: 'Setup Payout',
    icon: CreditCard,
  },
  {
    id: 'creator_action_share',
    title: 'Share your channel link',
    description: 'Promote your profile URL to your social followers.',
    actionUrl: '/settings',
    actionLabel: 'Get Link',
    icon: Share2,
  },
];

export const FirstActionsWidget: React.FC = () => {
  const { user } = useAuth();
  const isCreator = user?.role === 'creator';
  const actions = isCreator ? CREATOR_ACTIONS : FAN_ACTIONS;

  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Sync state on load and global event
  useEffect(() => {
    if (!user?.id) return;

    const sync = () => {
      const state = getFtueState(user.id);
      setCompletedIds(state.completedFirstActions || []);
      if (localStorage.getItem(`creatorpulse_first_actions_dismissed_${user.id}`) === 'true') {
        setIsDismissed(true);
      }
    };

    sync();
    window.addEventListener('creatorpulse_ftue_updated', sync);
    return () => window.removeEventListener('creatorpulse_ftue_updated', sync);
  }, [user?.id]);

  if (!user || isDismissed) return null;

  const handleToggleAction = (id: string) => {
    if (!user.id) return;
    completeFirstAction(user.id, id);
    setCompletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (user.id) {
      localStorage.setItem(`creatorpulse_first_actions_dismissed_${user.id}`, 'true');
    }
  };

  const completedCount = completedIds.filter((id) =>
    actions.some((a) => a.id === id)
  ).length;
  const progressPercent = Math.round((completedCount / actions.length) * 100);

  return (
    <div className="rounded-[28px] bg-gradient-to-br from-[#FFF9FC] via-[#FFF1F7]/80 to-[#FCE7F3]/40 dark:from-[#22152E] dark:via-[#1A1024] dark:to-[#2D162B] border border-[#F3DCE8] dark:border-[#3A2A4C] p-4 sm:p-5 shadow-sm space-y-4 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF8A00] to-[#E52E71] flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
            <Award size={18} />
          </div>
          <div>
            <h4 className="font-black text-sm text-[#18181B] dark:text-[#FDF2F8]">
              Recommended First Actions
            </h4>
            <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] font-medium">
              {completedCount} of {actions.length} completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-full text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8]"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8]"
            title="Dismiss checklist"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-[#E4E4E7] dark:bg-[#3A2A4C] h-1.5 rounded-full overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-[#FF8A00] via-[#EC4899] to-[#7928CA] rounded-full transition-all duration-500"
          />
        </div>
      </div>

      {/* Expanded Checklist */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {actions.map((item) => {
            const Icon = item.icon;
            const isDone = completedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleToggleAction(item.id)}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isDone
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                    : 'bg-white/80 dark:bg-[#150D1E]/80 border-[#F3DCE8] dark:border-[#3A2A4C] text-[#18181B] dark:text-[#FDF2F8] hover:border-pink-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isDone ? (
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-4.5 h-4.5 rounded-full border-2 border-[#A1A1AA] dark:border-[#8E7890] shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isDone ? 'line-through opacity-80' : ''}`}>
                      {item.title}
                    </p>
                    <p className="text-[10px] text-[#A1A1AA] truncate">
                      {item.description}
                    </p>
                  </div>
                </div>

                <Link
                  href={item.actionUrl}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleAction(item.id);
                  }}
                  className="text-[11px] font-extrabold text-[var(--color-primary)] hover:underline shrink-0 flex items-center gap-0.5"
                >
                  <span>{item.actionLabel}</span>
                  <ChevronRight size={12} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FirstActionsWidget;
