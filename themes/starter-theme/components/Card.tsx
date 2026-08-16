import React from 'react';

export interface ThemeCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

/**
 * Standardized Theme Card Component
 * Styled dynamically with theme card radius, surface background, and borders.
 */
export const Card: React.FC<ThemeCardProps> = ({
  children,
  className = '',
  hoverable = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)]/60 p-5 shadow-xs transition-all duration-200 ${
        hoverable
          ? 'hover:shadow-md hover:border-[var(--color-primary)]/40 hover:-translate-y-0.5 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
