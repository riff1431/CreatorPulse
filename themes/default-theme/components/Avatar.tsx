import React from 'react';
import { CheckCircle2, Radio } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isVerified?: boolean;
  hasStory?: boolean;
  storySeen?: boolean;
  isLive?: boolean;
  isOnline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  isVerified = false,
  hasStory = false,
  storySeen = false,
  isLive = false,
  isOnline = false,
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-28 h-28 text-2xl',
  };

  const initials = alt
    ? alt
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  const getStoryRing = () => {
    if (isLive) {
      return 'p-0.5 bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 animate-pulse';
    }
    if (hasStory) {
      return storySeen
        ? 'p-0.5 bg-slate-300 dark:bg-slate-700'
        : 'p-0.5 bg-gradient-to-tr from-[#EC4899] via-[#F43F5E] to-amber-400';
    }
    return '';
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-block select-none shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className={`rounded-full ${getStoryRing()}`}>
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-bold text-[#BE185D] dark:text-[#F472B6] bg-[#FCE7F3] dark:bg-[#381A2B] border-2 border-white dark:border-[#1A1222] shadow-xs`}
        >
          {src ? (
            <img src={src} alt={alt} className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </div>

      {/* Verified Badge */}
      {isVerified && !isLive && (
        <CheckCircle2
          className="absolute -bottom-0.5 -right-0.5 text-[#EC4899] fill-white dark:fill-[#1A1222] rounded-full shadow-xs"
          size={size === 'xs' ? 10 : size === 'sm' ? 12 : size === 'md' ? 16 : size === 'lg' ? 20 : 24}
        />
      )}

      {/* Online indicator */}
      {isOnline && !isLive && !isVerified && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1A1222]" />
      )}

      {/* LIVE Broadcast Badge */}
      {isLive && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-rose-600 text-white font-extrabold text-[8px] rounded-full uppercase tracking-wider flex items-center gap-0.5 shadow-xs ring-1 ring-white dark:ring-[#1A1222]">
          <Radio size={8} className="animate-pulse" />
          Live
        </span>
      )}
    </div>
  );
};

export default Avatar;
