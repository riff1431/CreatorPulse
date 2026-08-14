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
    pink: 'bg-pink-500/15 text-pink-300 border-pink-500/30 shadow-sm shadow-pink-500/10',
    fuchsia: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30 shadow-sm shadow-fuchsia-500/10',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-500/10',
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    cyan: 'bg-pink-500/15 text-pink-300 border-pink-500/30', // mapped to pink for theme uniformity
    slate: 'bg-pink-950/40 text-pink-200/80 border-pink-500/20'
  };

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3.5 py-1 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};
