import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pink' | 'fuchsia' | 'rose' | 'indigo' | 'emerald' | 'amber' | 'cyan' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'pink',
  size = 'sm',
  className = ''
}) => {
  const variantClasses = {
    pink: 'bg-[#FCE7F3] text-[#BE185D] border-[#FBCFE8]',
    fuchsia: 'bg-[#FDF4FF] text-[#A21CAF] border-[#F5D0FE]',
    rose: 'bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3]',
    indigo: 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]',
    emerald: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    amber: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    cyan: 'bg-[#FCE7F3] text-[#BE185D] border-[#FBCFE8]',
    slate: 'bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7]'
  };

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs font-semibold',
    md: 'px-3 py-1 text-sm font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};
