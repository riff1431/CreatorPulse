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
        
        {/* Ambient Video Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40 mix-blend-screen filter saturate-150"
          >
            <source src="https://cdn.sceneai.art/backgrounds/1dbf2b30-77a3-4e80-b72c-efd42aa485da.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B0612]/75 via-[#12081B]/70 to-[#08030D]/80 backdrop-blur-[1px]" />
        </div>

        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[600px] sm:h-[850px] bg-pink-600/15 rounded-full blur-[130px] pointer-events-none z-0" />

        {/* Top Back to Home Button */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 shadow-xs"
          >
            <ArrowLeft size={13} />
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

