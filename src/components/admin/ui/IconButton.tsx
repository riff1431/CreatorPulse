import React from 'react';
import { LucideProps } from 'lucide-react';
import { AdminIcon, AdminIconSize, AdminIconVariant, AdminIconRounded } from './AdminIcon';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ComponentType<LucideProps>;
  size?: AdminIconSize;
  variant?: AdminIconVariant;
  rounded?: AdminIconRounded;
  tooltip?: string;
  label: string; // Keeps accessibility high
  isLoading?: boolean;
  active?: boolean;
  glow?: boolean;
  hoverLift?: boolean;
  className?: string;
  iconClassName?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'neutral',
  rounded = 'md',
  tooltip,
  label,
  isLoading = false,
  active = false,
  glow = false,
  hoverLift = true,
  className = '',
  iconClassName = '',
  disabled,
  children,
  ...props
}) => {
  // Standard classes with support for accessibility hover tooltip trigger
  const baseClasses =
    'inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.97] select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none admin-tooltip-trigger';

  // Sizing definitions for buttons
  const buttonSizes: Record<AdminIconSize, string> = {
    xs: 'p-1 text-xs gap-1',
    sm: 'p-1.5 text-xs gap-1.5',
    md: 'p-2 text-xs gap-2',
    lg: 'p-2.5 text-sm gap-2',
    xl: 'p-3 text-base gap-2.5',
    '2xl': 'p-4 text-lg gap-3',
  };

  const roundingClasses: Record<AdminIconRounded, string> = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
    none: '',
  };

  // Color background/borders for buttons (non-pink slate/blue/indigo admin design scheme)
  const buttonVariants: Record<AdminIconVariant, string> = {
    neutral: active
      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 border border-slate-300'
      : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 shadow-2xs',
    primary: active
      ? 'bg-indigo-700 text-white border border-indigo-700 shadow-xs'
      : 'bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 shadow-2xs',
    indigo: active
      ? 'bg-indigo-700 text-white border border-indigo-700 shadow-xs'
      : 'bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/50 shadow-2xs',
    blue: active
      ? 'bg-blue-700 text-white border border-blue-700 shadow-xs'
      : 'bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200/50 shadow-2xs',
    emerald: active
      ? 'bg-emerald-700 text-white border border-emerald-700 shadow-xs'
      : 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/50 shadow-2xs',
    amber: active
      ? 'bg-amber-700 text-white border border-amber-700 shadow-xs'
      : 'bg-amber-50/80 hover:bg-amber-100 text-amber-700 border border-amber-200/50 shadow-2xs',
    rose: active
      ? 'bg-rose-700 text-white border border-rose-700 shadow-xs'
      : 'bg-rose-50/80 hover:bg-rose-100 text-rose-700 border border-rose-200/50 shadow-2xs',
    slate: active
      ? 'bg-slate-200 text-slate-800 border border-slate-300'
      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 shadow-2xs',
    info: active
      ? 'bg-blue-700 text-white border border-blue-700 shadow-xs'
      : 'bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200/50 shadow-2xs',
    warning: active
      ? 'bg-amber-700 text-white border border-amber-700 shadow-xs'
      : 'bg-amber-50/80 hover:bg-amber-100 text-amber-700 border border-amber-200/50 shadow-2xs',
    success: active
      ? 'bg-emerald-700 text-white border border-emerald-700 shadow-xs'
      : 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/50 shadow-2xs',
    danger: active
      ? 'bg-rose-700 text-white border border-rose-700 shadow-xs'
      : 'bg-rose-50/80 hover:bg-rose-100 text-rose-700 border border-rose-200/50 shadow-2xs',
  };

  let variantClasses = buttonVariants[variant];
  if (variant === 'neutral' && className.includes('bg-transparent')) {
    variantClasses =
      'bg-transparent hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-transparent';
  }

  const hoverLiftClass = hoverLift && !disabled ? 'hover:-translate-y-0.5' : '';
  const glowClass =
    glow && !disabled
      ? `admin-icon-glow-${
          variant === 'primary' ? 'indigo' : variant === 'neutral' ? 'indigo' : variant
        }`
      : '';

  const finalClassName = `${baseClasses} ${buttonSizes[size]} ${roundingClasses[rounded]} ${variantClasses} ${hoverLiftClass} ${glowClass} ${className}`.trim();

  return (
    <button
      type="button"
      className={finalClassName}
      aria-label={label}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-3.5 w-3.5 text-current shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <AdminIcon
          icon={icon}
          size={size}
          variant={variant === 'neutral' && !active ? 'neutral' : 'slate'}
          className={iconClassName}
          strokeWidth={size === 'xs' || size === 'sm' ? 2 : 1.75}
        />
      )}
      {children}
      {tooltip && <span className="admin-tooltip">{tooltip}</span>}
    </button>
  );
};
