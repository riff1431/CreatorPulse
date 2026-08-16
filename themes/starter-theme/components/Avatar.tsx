import React from 'react';
import { CheckCircle } from 'lucide-react';

export interface ThemeAvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isVerified?: boolean;
  hasStory?: boolean;
  storySeen?: boolean;
  className?: string;
}

/**
 * Standardized Theme Avatar Component
 * Displays user avatars with dynamic story indicators and verification badge.
 */
export const Avatar: React.FC<ThemeAvatarProps> = ({
  src,
  alt,
  size = 'md',
  isVerified = false,
  hasStory = false,
  storySeen = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const initials = (alt || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const ringStyle = hasStory
    ? storySeen
      ? 'ring-2 ring-slate-300 ring-offset-2'
      : 'ring-2 ring-[var(--color-primary)] ring-offset-2'
    : '';

  return (
    <div className={`relative inline-block select-none ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-bold text-[var(--color-primary)] bg-[var(--color-soft-primary)] border border-[var(--color-border)] shadow-xs ${ringStyle}`}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {isVerified && (
        <CheckCircle
          className="absolute -bottom-0.5 -right-0.5 text-[var(--color-primary)] fill-white bg-white rounded-full shadow-xs"
          size={size === 'sm' ? 13 : size === 'md' ? 16 : size === 'lg' ? 20 : 24}
        />
      )}
    </div>
  );
};

export default Avatar;
