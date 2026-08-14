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
      className={`bg-white/90 backdrop-blur-md border border-[#F3DCE8] rounded-[var(--radius-card)] shadow-sm shadow-[#EC4899]/5 transition-all duration-300 ${
        hoverable
          ? 'hover:bg-white hover:border-[#F472B6]/60 hover:shadow-lg hover:shadow-[#EC4899]/10 hover:-translate-y-1 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
