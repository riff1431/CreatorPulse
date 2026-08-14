import React from 'react';
import { LucideProps } from 'lucide-react';

export type AdminIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AdminIconVariant =
  | 'neutral'
  | 'primary'
  | 'indigo'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'slate'
  | 'info'
  | 'warning'
  | 'success'
  | 'danger';
export type AdminIconRounded = 'sm' | 'md' | 'lg' | 'full' | 'none';

export interface AdminIconProps {
  icon: React.ComponentType<LucideProps>;
  size?: AdminIconSize;
  variant?: AdminIconVariant;
  rounded?: AdminIconRounded;
  strokeWidth?: number;
  active?: boolean;
  container?: boolean;
  hoverLift?: boolean;
  gradientAccent?: boolean;
  glow?: boolean;
  className?: string;
  iconClassName?: string;
}

export const AdminIcon: React.FC<AdminIconProps> = ({
  icon: IconComponent,
  size = 'md',
  variant = 'neutral',
  rounded = 'md',
  strokeWidth = 1.75,
  active = false,
  container = false,
  hoverLift = false,
  gradientAccent = false,
  glow = false,
  className = '',
  iconClassName = '',
}) => {
  // Mapping sizes for the actual SVG icon inside
  const iconSizes: Record<AdminIconSize, number> = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
  };

  // Mapping sizes for the container wrapper
  const containerSizes: Record<AdminIconSize, string> = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
    '2xl': 'w-20 h-20',
  };

  // Rounding definitions
  const roundClasses: Record<AdminIconRounded, string> = {
    sm: 'admin-icon-rounded-sm',
    md: 'admin-icon-rounded-md',
    lg: 'admin-icon-rounded-lg',
    full: 'admin-icon-rounded-full',
    none: '',
  };

  // Variant color styling mappings
  const colorClasses: Record<AdminIconVariant, string> = {
    neutral: 'text-slate-600 dark:text-slate-400',
    primary: 'text-indigo-600 dark:text-indigo-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    blue: 'text-blue-600 dark:text-blue-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
    slate: 'text-slate-600 dark:text-slate-400',
    info: 'text-blue-600 dark:text-blue-400',
    warning: 'text-amber-600 dark:text-amber-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    danger: 'text-rose-600 dark:text-rose-400',
  };

  // Container style color variations
  const containerColorClasses: Record<AdminIconVariant, string> = {
    neutral: 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200/50 text-slate-600',
    primary: 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100/50 text-indigo-600',
    indigo: 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100/50 text-indigo-600',
    blue: 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100/50 text-blue-600',
    emerald: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100/50 text-emerald-600',
    amber: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100/50 text-amber-600',
    rose: 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100/50 text-rose-600',
    slate: 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200/50 text-slate-600',
    info: 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100/50 text-blue-600',
    warning: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100/50 text-amber-600',
    success: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100/50 text-emerald-600',
    danger: 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100/50 text-rose-600',
  };

  // Combine classes
  let appliedClasses = '';
  if (container) {
    appliedClasses += `admin-icon-container ${containerSizes[size]} ${roundClasses[rounded]} `;
    if (active) {
      appliedClasses += 'admin-icon-active ';
    } else if (gradientAccent) {
      appliedClasses += 'admin-icon-gradient-blue-indigo ';
    } else {
      appliedClasses += `${containerColorClasses[variant]} `;
    }

    if (hoverLift) {
      appliedClasses += 'admin-icon-hover-lift ';
    }

    if (glow && !active) {
      if (variant === 'primary' || variant === 'indigo') appliedClasses += 'admin-icon-glow-indigo ';
      else if (variant === 'blue' || variant === 'info') appliedClasses += 'admin-icon-glow-blue ';
      else if (variant === 'emerald' || variant === 'success') appliedClasses += 'admin-icon-glow-emerald ';
      else if (variant === 'amber' || variant === 'warning') appliedClasses += 'admin-icon-glow-amber ';
      else if (variant === 'rose' || variant === 'danger') appliedClasses += 'admin-icon-glow-rose ';
    }
  } else {
    // Raw icon styling
    appliedClasses += `${colorClasses[variant]} `;
    if (hoverLift) {
      appliedClasses += 'hover:scale-110 transition-transform duration-200 ';
    }
  }

  const wrapperClass = `${appliedClasses} ${className}`.trim();

  if (container) {
    return (
      <div className={wrapperClass}>
        <IconComponent
          size={iconSizes[size]}
          strokeWidth={strokeWidth}
          className={`${iconClassName} shrink-0`}
        />
      </div>
    );
  }

  return (
    <IconComponent
      size={iconSizes[size]}
      strokeWidth={strokeWidth}
      className={`${wrapperClass} ${iconClassName} shrink-0`}
    />
  );
};
