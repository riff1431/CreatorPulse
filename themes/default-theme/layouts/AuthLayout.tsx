'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useSiteSettings } from '@/lib/settings/site-settings-context';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { settings } = useSiteSettings();
  const siteName = settings.site_name || 'CreatorPulse';

  return (
    <div className="min-h-screen bg-[#FFF9FC] dark:bg-[#0F0A14] text-[#18181B] dark:text-[#FDF2F8] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
      
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-pink-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Back to Home Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899] transition-colors bg-white/80 dark:bg-[#1A1222]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xs"
        >
          <ArrowLeft size={14} />
          <span>Home</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt={siteName} className="h-10 w-auto max-w-[160px] object-contain rounded-2xl mx-auto" />
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F43F5E] flex items-center justify-center text-white shadow-md shadow-pink-500/30 group-hover:scale-105 transition-transform">
                <Sparkles size={20} />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#18181B] dark:text-[#FDF2F8]">
                {siteName}
              </span>
            </div>
          )}
        </Link>
        {title && <h2 className="text-2xl font-black text-[#18181B] dark:text-[#FDF2F8] tracking-tight">{title}</h2>}
        {subtitle && <p className="mt-2 text-xs font-medium text-[#71717A] dark:text-[#D4B8D0]">{subtitle}</p>}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 dark:bg-[#1A1222]/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl shadow-pink-500/5 rounded-3xl border border-[#F3DCE8] dark:border-[#3A2A4C]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
