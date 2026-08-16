'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X, Sparkles } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error' | 'gradient';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  onDismiss,
  className = '',
}) => {
  const defaultIcons = {
    info: <Info size={16} className="text-[#EC4899]" />,
    success: <CheckCircle2 size={16} className="text-emerald-500" />,
    warning: <AlertTriangle size={16} className="text-amber-500" />,
    error: <AlertCircle size={16} className="text-rose-500" />,
    gradient: <Sparkles size={16} className="text-[#EC4899]" />,
  };

  const variantStyles = {
    info: 'bg-[#FFF1F7] dark:bg-[#381A2B]/70 border-[#FBCFE8] dark:border-[#4C1D3B] text-[#BE185D] dark:text-[#F472B6]',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
    warning: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    error: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200',
    gradient: 'bg-gradient-to-r from-[#FFF1F7] to-[#FCE7F3] dark:from-[#241A30] dark:to-[#1A1222] border-[#F3DCE8] dark:border-[#3A2A4C] text-[#18181B] dark:text-[#FDF2F8]',
  };

  return (
    <div
      role="alert"
      className={`p-4 rounded-2xl border flex items-start gap-3 transition-all duration-200 ${variantStyles[variant]} ${className}`}
    >
      <div className="shrink-0 mt-0.5">{icon || defaultIcons[variant]}</div>

      <div className="flex-1 min-w-0 text-xs">
        {title && <h5 className="font-black text-xs mb-0.5 tracking-tight">{title}</h5>}
        <div className="leading-relaxed opacity-95 font-medium">{children}</div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 p-1 hover:opacity-75 transition-opacity cursor-pointer -mr-1 -mt-1"
          aria-label="Dismiss alert"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default Alert;
