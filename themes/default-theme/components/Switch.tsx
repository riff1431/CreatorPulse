'use client';

import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const isSm = size === 'sm';

  return (
    <label
      className={`inline-flex items-start gap-3 select-none cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 cursor-pointer ${
          isSm ? 'w-8 h-4.5 p-0.5' : 'w-11 h-6 p-0.5'
        } ${checked ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] ' : 'bg-[#E4E4E7] dark:bg-[#3A2A4C]'}`}
      >
        <span
          className={`block rounded-full bg-[var(--color-surface)] shadow-md transform transition-transform duration-200 ${
            isSm
              ? `w-3.5 h-3.5 ${checked ? 'translate-x-3.5' : 'translate-x-0'}`
              : `w-5 h-5 ${checked ? 'translate-x-5' : 'translate-x-0'}`
          }`}
        />
      </button>

      {(label || description) && (
        <div className="text-left -mt-0.5">
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

export default Switch;
