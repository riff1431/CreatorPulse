'use client';

import React, { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      children,
      className = '',
      containerClassName = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full space-y-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`w-full appearance-none bg-[#FFF9FC] dark:bg-[#241A30] text-[#18181B] dark:text-[#FDF2F8] text-xs font-bold rounded-2xl border transition-all duration-200 py-2.5 pl-3.5 pr-10 outline-none cursor-pointer ${
              error
                ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-500/20'
                : 'border-[#F3DCE8] dark:border-[#3A2A4C] focus:border-[#EC4899] focus:bg-white dark:focus:bg-[#1A1222] focus:ring-2 focus:ring-pink-500/15'
            } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : ''} ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-white dark:bg-[#1A1222]">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <ChevronDown
            size={16}
            className="absolute right-3.5 text-[#A1A1AA] dark:text-[#8E7890] pointer-events-none"
          />
        </div>

        {error ? (
          <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1 animate-in fade-in">
            <AlertCircle size={12} className="shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-[#71717A] dark:text-[#8E7890] mt-1 font-medium">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
