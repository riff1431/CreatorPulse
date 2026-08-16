'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'soft' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold transition-all duration-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98] shrink-0';

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#EC4899] to-[#F43F5E] text-white shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/35 hover:-translate-y-0.5 border border-transparent',
    secondary:
      'bg-white dark:bg-[#1A1222] hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] text-[#BE185D] dark:text-[#F472B6] border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xs hover:-translate-y-0.5',
    outline:
      'bg-transparent hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] text-[#18181B] dark:text-[#FDF2F8] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#EC4899] hover:text-[#EC4899]',
    ghost:
      'bg-transparent hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] dark:hover:text-[#F472B6]',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 hover:-translate-y-0.5 border border-transparent',
    soft:
      'bg-[#FCE7F3] dark:bg-[#381A2B] hover:bg-[#FBCFE8] dark:hover:bg-[#4C1D3B] text-[#BE185D] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B]',
    gradient:
      'bg-gradient-to-tr from-[#EC4899] via-[#F43F5E] to-[#FB7185] text-white shadow-lg shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98]',
  };

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-[11px] gap-1 rounded-xl',
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-xl',
    md: 'px-4.5 py-2.5 text-xs gap-2 rounded-2xl',
    lg: 'px-6 py-3 text-sm gap-2.5 rounded-2xl font-black',
    xl: 'px-8 py-4 text-base gap-3 rounded-3xl font-black shadow-xl',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 text-current shrink-0"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}

      <span className="truncate">{children}</span>

      {rightIcon && !isLoading && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
