'use client';

import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCount = false,
      maxLength,
      value,
      className = '',
      containerClassName = '',
      disabled,
      rows = 3,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className={`w-full space-y-1.5 ${containerClassName}`}>
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]"
            >
              {label}
            </label>
          )}

          {showCount && maxLength && (
            <span className="text-[10px] text-[#A1A1AA] dark:text-[#8E7890] font-medium">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          className={`w-full bg-[#FFF9FC] dark:bg-[#241A30] text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] dark:placeholder-[#8E7890] text-xs font-medium rounded-2xl border transition-all duration-200 p-3.5 outline-none resize-none leading-relaxed ${
            error
              ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-500/20'
              : 'border-[#F3DCE8] dark:border-[#3A2A4C] focus:border-[#EC4899] focus:bg-white dark:focus:bg-[#1A1222] focus:ring-2 focus:ring-pink-500/15'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : ''} ${className}`}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
export default Textarea;
