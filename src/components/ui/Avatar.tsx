import React from 'react';
import { CheckCircle } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isVerified?: boolean;
  hasStory?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  isVerified = false,
  hasStory = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl'
  };

  const initials = alt
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-semibold text-slate-200 bg-slate-800 border border-slate-700 ${
          hasStory ? 'story-ring' : ''
        }`}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {isVerified && (
        <CheckCircle
          className="absolute -bottom-0.5 -right-0.5 text-cyan-400 fill-slate-900 bg-slate-900 rounded-full"
          size={size === 'sm' ? 12 : size === 'md' ? 15 : size === 'lg' ? 18 : 22}
        />
      )}
    </div>
  );
};
