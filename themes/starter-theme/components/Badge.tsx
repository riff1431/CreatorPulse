import React from 'react';

export interface ThemeBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'emerald' | 'amber' | 'rose' | 'slate' | 'pink';
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Standardized Theme Badge Component
 * Leverages theme token variables and status tints.
 */
export const Badge: React.FC<ThemeBadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    primary: 'bg-[var(--color-soft-primary)] text-[var(--color-primary)] border-[var(--color-primary)]/20',
    secondary: 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
    accent: 'bg-amber-50 text-amber-600 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    pink: 'bg-pink-50 text-pink-700 border-pink-200',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs font-semibold',
    md: 'px-3 py-1 text-sm font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${
        variantStyles[variant] || variantStyles.primary
      } ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
