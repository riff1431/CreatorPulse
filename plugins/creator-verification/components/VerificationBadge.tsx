'use client';

import React from 'react';
import { BadgeCheck } from 'lucide-react';

interface VerificationBadgeProps {
  style?: 'standard' | 'premium' | 'animated';
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  verifiedDate?: string;
  className?: string;
}

export default function VerificationBadge({
  style = 'standard',
  color,
  size = 'md',
  showTooltip = true,
  verifiedDate,
  className = ''
}: VerificationBadgeProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-[18px] h-[18px]',
    lg: 'w-6 h-6'
  };

  const iconClasses = sizeClasses[size];

  const getBadgeStyle = () => {
    switch (style) {
      case 'premium':
        return `text-emerald-500 drop-shadow-md bg-gradient-to-br from-emerald-100 to-white rounded-full ${color ? `text-[${color}]` : ''}`;
      case 'animated':
        return `text-emerald-500 animate-pulse ${color ? `text-[${color}]` : ''}`;
      case 'standard':
      default:
        return `text-emerald-500 ${color ? `text-[${color}]` : ''}`;
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center group ${className}`}>
      <BadgeCheck className={`${iconClasses} ${getBadgeStyle()}`} />
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-800 text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg pointer-events-none flex flex-col items-center">
          <span>Verified Creator</span>
          {verifiedDate && (
            <span className="text-[9px] text-slate-300 font-medium mt-0.5">Since {verifiedDate}</span>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
}
