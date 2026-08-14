import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EC4899]/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]';

  const variantStyles = {
    primary: 'gradient-btn text-white font-semibold shadow-md shadow-[#EC4899]/20 hover:shadow-lg hover:shadow-[#EC4899]/30 hover:-translate-y-0.5',
    secondary: 'bg-white hover:bg-[#FFF1F7] text-[#EC4899] font-semibold border border-[#F3DCE8] hover:border-[#F472B6]/50 shadow-sm shadow-[#EC4899]/5 hover:-translate-y-0.5',
    outline: 'bg-white/80 hover:bg-[#FDF2F8] text-[#18181B] border border-[#F3DCE8] hover:border-[#EC4899]/40 hover:text-[#DB2777] shadow-sm',
    ghost: 'bg-transparent hover:bg-[#FCE7F3]/50 text-[#71717A] hover:text-[#DB2777]',
    danger: 'bg-[#F43F5E] hover:bg-[#E11D48] text-white shadow-md shadow-[#F43F5E]/20 hover:-translate-y-0.5'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 font-semibold',
    md: 'px-4 py-2 text-sm gap-2 font-semibold',
    lg: 'px-6 py-3 text-base gap-2.5 font-bold'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {rightIcon && !isLoading && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
