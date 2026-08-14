import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-xl shadow-xs transition-all duration-300 ${
        hoverable
          ? 'hover:bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:translate-y-0'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
