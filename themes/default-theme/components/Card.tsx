import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'outline' | 'soft' | 'glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: 'bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-xs',
      glass: 'bg-white/85 dark:bg-[#1A1222]/85 backdrop-blur-xl border border-[#F3DCE8]/80 dark:border-[#3A2A4C]/80 shadow-md',
      elevated: 'bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-lg shadow-pink-500/5',
      outline: 'bg-transparent border border-[#F3DCE8] dark:border-[#3A2A4C]',
      soft: 'bg-[#FFF9FC] dark:bg-[#241A30] border border-[#FCE7F3] dark:border-[#381A2B]',
      glow: 'bg-white/90 dark:bg-[#1A1222]/90 backdrop-blur-xl border border-[#EC4899]/30 shadow-xl shadow-pink-500/15',
    };

    const paddingStyles = {
      none: 'p-0',
      sm: 'p-3 sm:p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8',
    };

    const hoverStyles = hoverable
      ? 'hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/15 hover:border-[#EC4899]/50 cursor-pointer transition-all duration-300 active:scale-[0.99]'
      : 'transition-all duration-200';

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`rounded-2xl sm:rounded-3xl ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
