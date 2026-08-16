import React from 'react';
import { CheckCircle } from 'lucide-react';

export interface CreatorBadgeProps {
  name: string;
  isVerified?: boolean;
  className?: string;
}

/**
 * Starter Theme SDK Partial: Creator Badge
 */
export const CreatorBadge: React.FC<CreatorBadgeProps> = ({
  name,
  isVerified = true,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--color-soft-primary)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 ${className}`}
    >
      {isVerified && <CheckCircle size={13} className="text-[var(--color-primary)]" />}
      <span>{name}</span>
    </span>
  );
};

export default CreatorBadge;
