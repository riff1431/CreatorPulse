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
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base'
  };

  const initials = alt
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={`relative inline-block select-none ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-bold text-slate-700 bg-slate-100 border border-slate-200/80 shadow-xs`}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {isVerified && (
        <CheckCircle
          className="absolute -bottom-0.5 -right-0.5 text-blue-500 fill-white bg-white rounded-full shadow-xs"
          size={size === 'sm' ? 12 : size === 'md' ? 14 : size === 'lg' ? 16 : 18}
        />
      )}
    </div>
  );
};
