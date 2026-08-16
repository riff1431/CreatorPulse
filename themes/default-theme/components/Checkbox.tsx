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
            ? 'bg-gradient-to-tr from-[#EC4899] to-[#F43F5E] border-transparent text-white shadow-2xs'
            : 'border-[#F3DCE8] dark:border-[#3A2A4C] bg-white dark:bg-[#241A30] group-hover:border-[#EC4899]'
        }`}
      >
        {checked && <Check size={12} strokeWidth={3} className="animate-in zoom-in-75" />}
      </div>

      {(label || description) && (
        <div className="text-left">
          {label && (
            <span className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-[11px] text-[#71717A] dark:text-[#8E7890] mt-0.5 font-normal">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};

export default Checkbox;
