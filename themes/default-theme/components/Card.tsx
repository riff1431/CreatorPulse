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
      default: 'bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs',
      glass: 'bg-[var(--color-surface)] /85 /85 backdrop-blur-xl border border-[var(--color-border)] /80 /80 shadow-md',
      elevated: 'bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg shadow-[var(--color-primary)]/5 ',
      outline: 'bg-transparent border border-[var(--color-border)] ',
      soft: 'bg-[var(--color-bg)] border border-[#FCE7F3] dark:border-[#381A2B]',
      glow: 'bg-[var(--color-surface)] /90 /90 backdrop-blur-xl border border-[var(--color-primary)] /30 shadow-xl shadow-pink-500/15',
    };

    const paddingStyles = {
      none: 'p-0',
      sm: 'p-3 sm:p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8',
    };

    const hoverStyles = hoverable
      ? 'hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/15 hover:border-[var(--color-primary)] /50 cursor-pointer transition-all duration-300 active:scale-[0.99]'
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
