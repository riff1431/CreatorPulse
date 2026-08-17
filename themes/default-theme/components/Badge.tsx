import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'pink' | 'fuchsia' | 'rose' | 'indigo' | 'emerald' | 'amber' | 'cyan' | 'slate' | 'gradient';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'pink',
  size = 'sm',
  dot = false,
  className = '',
  ...props
}) => {
  const variantClasses = {
    pink: 'bg-[var(--color-soft-primary)] text-[var(--color-primary)] border-[#FBCFE8] ',
    fuchsia: 'bg-[#FDF4FF] text-[#A21CAF] border-[#F5D0FE] dark:bg-[#3B154C] dark:text-[#E879F9] dark:border-[#581C87]',
    rose: 'bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3] dark:bg-[#3E141D] dark:text-[#FB7185] dark:border-[#5A1C28]',
    indigo: 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE] dark:bg-[#1E1B4B] dark:text-[#A78BFA] dark:border-[#312E81]',
    emerald: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0] dark:bg-[#064E3B] dark:text-[#34D399] dark:border-[#065F46]',
    amber: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] dark:bg-[#78350F] dark:text-[#FBBF24] dark:border-[#92400E]',
    cyan: 'bg-[#ECFEFF] text-[#0E7490] border-[#CFFAFE] dark:bg-[#164E63] dark:text-[#22D3EE] dark:border-[#155E75]',
    slate: 'bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7] dark:bg-[#27272A] dark:text-[#D4D4D8] dark:border-[#3F3F46]',
    gradient: 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white border-transparent shadow-xs',
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] font-bold',
    sm: 'px-2.5 py-0.5 text-xs font-bold',
    md: 'px-3 py-1 text-xs font-extrabold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantClasses[variant]} ${sizeClasses[size]} select-none ${className}`}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 animate-pulse" />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
