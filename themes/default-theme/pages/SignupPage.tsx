'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { GuestGuard } from '@/components/auth/RouteGuards';
import { UnifiedAuthPage } from './LoginPage';

export function SignupPage() {
  return (
    <GuestGuard>
      <div className="min-h-screen w-full bg-[#0B0612] flex flex-col items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden transition-colors duration-200 selection:bg-[var(--color-primary,#EC4899)] selection:text-white">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[900px] h-[650px] sm:h-[900px] bg-pink-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0515] via-[#12081B] to-[#08030D] pointer-events-none" />

        {/* Top Back to Home Button */}
        <div className="absolute top-4 sm:top-5 left-4 sm:left-5 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-slate-900/80 backdrop-blur-md px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full border border-slate-800 shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>Home</span>
          </Link>
        </div>

        <Suspense fallback={
          <div className="p-8 text-center text-xs text-slate-400 font-bold relative z-10">
            Loading signup portal...
          </div>
        }>
          <UnifiedAuthPage initialMode="signup" />
        </Suspense>
      </div>
    </GuestGuard>
  );
}

export default SignupPage;

