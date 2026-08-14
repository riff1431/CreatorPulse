import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'indigo' | 'emerald' | 'rose' | 'amber' | 'cyan' | 'slate' | 'pink' | 'fuchsia';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className = ''
}) => {
  const variantClasses = {
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    cyan: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    slate: 'bg-slate-50 text-slate-600 border border-slate-200',
    // Fallback support for compatibility with original code
    pink: 'bg-blue-50 text-blue-700 border border-blue-200',
    fuchsia: 'bg-indigo-50 text-indigo-700 border border-indigo-200'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] font-bold tracking-tight',
    md: 'px-2.5 py-0.5 text-xs font-bold tracking-tight'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md leading-none border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};
