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
    <div className={`relative inline-block select-none ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-bold text-[#BE185D] bg-[#FCE7F3] border border-[#F3DCE8] shadow-sm ${
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
          className="absolute -bottom-0.5 -right-0.5 text-[#EC4899] fill-white bg-white rounded-full shadow-sm"
          size={size === 'sm' ? 13 : size === 'md' ? 16 : size === 'lg' ? 20 : 24}
        />
      )}
    </div>
  );
};
