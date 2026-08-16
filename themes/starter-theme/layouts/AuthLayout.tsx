'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * Starter Theme SDK Auth Layout Override
 */
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white shadow-md shadow-[var(--color-primary)]/20">
            <Sparkles size={20} />
          </div>
          <span className="text-2xl font-black tracking-tight text-[var(--color-text-primary)]">
            Creator<span className="text-[var(--color-primary)]">Pulse</span>
          </span>
        </Link>
        {title && (
          <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--color-surface)] py-8 px-4 shadow-lg sm:rounded-[var(--radius-card)] sm:px-10 border border-[var(--color-border)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
