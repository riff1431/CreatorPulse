'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}) => {
  return (
    <label
      className={`inline-flex items-start gap-2.5 select-none cursor-pointer group ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`w-4.5 h-4.5 rounded-lg border flex items-center justify-center transition-all duration-150 shrink-0 mt-0.5 ${
          checked
            ? 'bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] border-transparent text-white shadow-2xs'
            : 'border-[var(--color-border)] bg-[var(--color-surface)] group-hover:border-[var(--color-primary)] '
        }`}
      >
        {checked && <Check size={12} strokeWidth={3} className="animate-in zoom-in-75" />}
      </div>

      {(label || description) && (
        <div className="text-left">
          {label && (
            <span className="block text-xs font-bold text-[var(--color-text-primary)] ">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-[11px] text-[var(--color-text-secondary)] dark:text-[#8E7890] mt-0.5 font-normal">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};

export default Checkbox;
