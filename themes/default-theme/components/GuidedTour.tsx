'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ArrowRight, ArrowLeft, Check, X, 
  HelpCircle, Eye, Compass, Radio, Heart
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { markTourCompleted } from '@/lib/ftue/ftue-store';

export interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  position?: 'bottom' | 'top' | 'left' | 'right';
  role?: 'member' | 'creator' | 'all';
}

const FAN_TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour="stories"]',
    title: '24-Hour Stories & Live Streams',
    description: 'Tap any creator circle to watch behind-the-scenes stories, or join live video broadcasts in real time.',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tour="search"]',
    title: 'Universal Pill Search',
    description: 'Instant live filtering across creator names, locations, tags, and topics.',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tour="create-post"]',
    title: 'Create & Share Moments',
    description: 'Post high-resolution photos, stories, and thoughts to the global community feed.',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tour="post-card"]',
    title: 'Post Actions & VIP Drops',
    description: 'Double-tap or click Heart to like, comment with fellow fans, tip creators, or unlock VIP exclusives.',
    position: 'top',
  },
  {
    targetSelector: '[data-tour="sidebar-profile"]',
    title: 'Your Profile & Highlights',
    description: 'View your profile stats, review your saved drops, and manage your account settings.',
    position: 'right',
  },
];

const CREATOR_TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour="create-post"]',
    title: 'Publish VIP Drops & Posts',
    description: 'Upload tutorials, project files, or behind-the-scenes moments with custom paywalls.',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tour="stories"]',
    title: 'Broadcast Stories & Go LIVE',
    description: 'Engage your followers directly with 24-hour video updates and live streaming.',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tour="sidebar-profile"]',
    title: 'Channel Identity & Highlights',
    description: 'Organize your top stories into permanent highlights and showcase your creator bio.',
    position: 'right',
  },
];

interface GuidedTourProps {
  isActive: boolean;
  onComplete: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ isActive, onComplete }) => {
  const { user } = useAuth();
  const isCreator = user?.role === 'creator';
  const steps = isCreator ? CREATOR_TOUR_STEPS : FAN_TOUR_STEPS;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = steps[currentStepIndex];

  // Recalculate target element position
  useEffect(() => {
    if (!isActive || !step) return;

    const updatePosition = () => {
      const el = document.querySelector(step.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isActive, currentStepIndex, step]);

  if (!isActive || !step || !user) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleFinish = () => {
    if (user.id) {
      markTourCompleted(user.id);
    }
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto select-none">
      {/* Dark overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={handleFinish}
      />

      {/* Target Spotlight Highlight Ring */}
      {targetRect && (
        <div
          style={{
            top: `${targetRect.top - 8}px`,
            left: `${targetRect.left - 8}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
          }}
          className="absolute rounded-3xl ring-4 ring-[var(--color-primary)] ring-offset-4 ring-offset-black/50 shadow-2xl pointer-events-none transition-all duration-300 animate-pulse"
        />
      )}

      {/* Floating Tour Card */}
      <div
        style={{
          top: targetRect ? `${Math.min(window.innerHeight - 240, Math.max(80, targetRect.bottom + 20))}px` : '50%',
          left: targetRect ? `${Math.min(window.innerWidth - 380, Math.max(20, targetRect.left))}px` : '50%',
          transform: targetRect ? 'none' : 'translate(-50%, -50%)',
        }}
        className="absolute z-50 max-w-sm w-full bg-white dark:bg-[#150D1E] rounded-3xl p-5 border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-300"
      >
        {/* Step Counter & Skip */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-pink-100 text-[#EC4899] dark:bg-pink-950/60 dark:text-pink-400">
            Step {currentStepIndex + 1} of {steps.length}
          </span>

          <button
            onClick={handleFinish}
            className="text-xs font-bold text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8] cursor-pointer"
          >
            Skip Tour
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <h4 className="text-sm font-black text-[#18181B] dark:text-[#FDF2F8]">
            {step.title}
          </h4>
          <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] font-medium leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F3DCE8] dark:border-[#3A2A4C]">
          {currentStepIndex > 0 ? (
            <button
              onClick={handlePrev}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>
          ) : (
            <span />
          )}

          <button
            onClick={handleNext}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white text-xs font-extrabold shadow-md shadow-pink-500/20 hover:opacity-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{currentStepIndex === steps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            {currentStepIndex === steps.length - 1 ? <Check size={13} strokeWidth={3} /> : <ArrowRight size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;
