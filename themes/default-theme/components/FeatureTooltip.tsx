'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { isTooltipDismissed, dismissTooltip } from '@/lib/ftue/ftue-store';

interface FeatureTooltipProps {
  tooltipId: string;
  title: string;
  description: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const FeatureTooltip: React.FC<FeatureTooltipProps> = ({
  tooltipId,
  title,
  description,
  children,
  position = 'bottom',
}) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const dismissed = isTooltipDismissed(user.id, tooltipId);
      setIsVisible(!dismissed);
    }
  }, [user?.id, tooltipId]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (user?.id) {
      dismissTooltip(user.id, tooltipId);
    }
  };

  return (
    <div className="relative inline-block">
      {children}

      {isVisible && (
        <div
          className={`absolute z-40 w-64 p-3.5 rounded-2xl bg-[#150D1E] text-white border border-pink-500/40 shadow-xl shadow-pink-500/20 space-y-2 select-none animate-in fade-in zoom-in-95 duration-300 ${
            position === 'bottom'
              ? 'top-full mt-2 left-1/2 -translate-x-1/2'
              : position === 'top'
              ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
              : position === 'left'
              ? 'right-full mr-2 top-1/2 -translate-y-1/2'
              : 'left-full ml-2 top-1/2 -translate-y-1/2'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[var(--color-primary)]">
              <Sparkles size={13} />
              <span className="font-extrabold text-[10px] uppercase tracking-wider">
                Tip
              </span>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/60 hover:text-white p-0.5"
            >
              <X size={13} />
            </button>
          </div>

          <div>
            <p className="font-bold text-xs">{title}</p>
            <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">
              {description}
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full py-1.5 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white font-extrabold text-[10px] shadow-sm hover:opacity-90 flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Got it</span>
            <Check size={11} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FeatureTooltip;
