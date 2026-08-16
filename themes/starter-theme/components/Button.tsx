import React from 'react';

export interface ThemeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Standardized Theme Button Component
 * Applies theme CSS variables dynamically for button radii, focus ring, and color tokens.
 */
export const Button: React.FC<ThemeButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-[var(--radius-button)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98] ';

  let variantStyle = '';
  switch (variant) {
    case 'primary':
      variantStyle =
        'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-md shadow-[var(--color-primary)]/20 hover:shadow-lg hover:shadow-[var(--color-primary)]/30 hover:-translate-y-0.5 border border-transparent';
      break;
    case 'secondary':
      variantStyle =
        'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]/40 border border-[var(--color-border)]/50 shadow-xs hover:-translate-y-0.5';
      break;
    case 'accent':
      variantStyle =
        'bg-[var(--color-accent)] text-white hover:opacity-95 shadow-md shadow-[var(--color-accent)]/20 hover:-translate-y-0.5 border border-transparent';
      break;
    case 'outline':
      variantStyle =
        'bg-transparent hover:bg-[var(--color-soft-primary)] text-[var(--color-primary)] border border-[var(--color-primary)]/40 shadow-xs';
      break;
    case 'danger':
      variantStyle =
        'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 hover:-translate-y-0.5 border border-transparent';
      break;
    case 'ghost':
    default:
      variantStyle =
        'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]/60 border border-transparent shadow-none';
      break;
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5 font-bold',
  };

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${sizeStyles[size]} ${className}`}
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

export default Button;
