import React from 'react';

export interface ThemeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  children: React.ReactNode;
}

/**
 * Standardized Theme Button Component
 * Applies theme CSS variables dynamically for button radii and color tokens.
 */
export const ThemeButton: React.FC<ThemeButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  let baseStyle = "px-4 py-2.5 rounded-[var(--radius-button)] text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs active:scale-95 inline-flex items-center justify-center gap-2 ";
  
  if (variant === 'primary') {
    baseStyle += "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] border border-transparent";
  } else if (variant === 'secondary') {
    baseStyle += "bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]/40 border border-[var(--color-border)]/50";
  } else if (variant === 'accent') {
    baseStyle += "bg-[var(--color-accent)] text-white hover:opacity-90 border border-transparent";
  } else {
    baseStyle += "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]/50 border border-transparent shadow-none";
  }

  return (
    <button
      {...props}
      className={`${baseStyle} ${className}`}
    >
      {children}
    </button>
  );
};

export default ThemeButton;
