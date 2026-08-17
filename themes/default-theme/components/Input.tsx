'use client';

import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, X, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  isPassword?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      clearable = false,
      onClear,
      isPassword = false,
      type = 'text',
      className = '',
      containerClassName = '',
      disabled,
      value,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`w-full space-y-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold text-[var(--color-text-primary)] transition-colors"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[var(--color-text-muted)] dark:text-[#8E7890] flex items-center pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full bg-[var(--color-bg)] text-[var(--color-text-primary)] placeholder-[#A1A1AA] dark:placeholder-[#8E7890] text-xs font-medium rounded-2xl border transition-all duration-200 py-2.5 px-3.5 outline-none ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon || isPassword || clearable ? 'pr-10' : ''} ${
              error
                ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-500/20'
                : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] dark:focus:bg-[#1A1222] focus:ring-2 focus:ring-pink-500/15'
            } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : ''} ${className}`}
            {...props}
          />

          {/* Right Action: Clear / Password Toggle / Custom Icon */}
          <div className="absolute right-3 flex items-center gap-1.5 text-[var(--color-text-muted)] dark:text-[#8E7890]">
            {clearable && value && !disabled && (
              <button
                type="button"
                onClick={onClear}
                className="p-1 hover:text-[var(--color-text-primary)] dark:hover:text-[#FDF2F8] rounded-md transition-colors"
                tabIndex={-1}
              >
                <X size={14} />
              </button>
            )}

            {isPassword && !disabled && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            )}

            {rightIcon && !isPassword && <div className="pointer-events-none">{rightIcon}</div>}
          </div>
        </div>

        {/* Helper text or Validation error */}
        {error ? (
          <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1 animate-in fade-in">
            <AlertCircle size={12} className="shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-[var(--color-text-secondary)] dark:text-[#8E7890] mt-1 font-medium">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
