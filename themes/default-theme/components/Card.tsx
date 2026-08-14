import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`theme-card backdrop-blur-md transition-all duration-300 ${
        hoverable
          ? 'theme-card-hover cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
