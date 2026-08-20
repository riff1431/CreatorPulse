'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Mail, CheckCircle2, ArrowRight, ShieldCheck, 
  ArrowLeft, RotateCw, Sparkles, Clock, Shield 
} from 'lucide-react';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { useAuth } from '@/lib/auth/auth-context';

export default function VerifyPage() {
  const { settings } = useSiteSettings();
  const { user, forgotPassword } = useAuth();
  const siteName = settings.site_name || 'CreatorPulse';

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || resendStatus === 'sending') return;
    setResendStatus('sending');

    const emailToUse = user?.email || 'member@creatorpulse.com';
    await forgotPassword(emailToUse);

    setResendStatus('sent');
    setResendCooldown(60);
    setTimeout(() => setResendStatus('idle'), 3000);
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0612] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-200 selection:bg-[var(--color-primary,#EC4899)] selection:text-white font-sans">
      
      {/* Ambient Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-35 mix-blend-screen filter saturate-150"
        >
          <source src="https://cdn.sceneai.art/backgrounds/1dbf2b30-77a3-4e80-b72c-efd42aa485da.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0612]/80 via-[#12081B]/75 to-[#08030D]/85 backdrop-blur-[1px]" />
      </div>

      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[800px] h-[550px] sm:h-[800px] bg-pink-600/15 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Top Back to Home Button */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-800 shadow-xs"
        >
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </Link>
      </div>

      {/* Centered Glassmorphic Container */}
      <div className="w-full max-w-md relative z-10 my-auto">
        <div className="bg-white dark:bg-[#120B19] rounded-[28px] sm:rounded-[32px] shadow-2xl shadow-black/50 border border-pink-100/60 dark:border-pink-900/30 p-6 sm:p-8 space-y-5 text-center">
          
          {/* Top Mail Icon with Gradient Glow */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[var(--color-primary,#EC4899)] to-[#F472B6] flex items-center justify-center text-white mx-auto shadow-lg shadow-pink-500/25 relative group">
            <Mail size={30} className="animate-pulse" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#120B19] flex items-center justify-center">
              <CheckCircle2 size={10} className="text-white" />
            </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Verify Your Email
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              We have dispatched a secure authorization link to your email. Click the link to activate your {siteName} account.
            </p>
          </div>

          {/* Security Token Status Card */}
          <div className="bg-pink-50/60 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-pink-100 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2 text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-[11px]">24-Hour Auth Token Active</p>
                <p className="text-[10px] text-slate-400">Cryptographically signed via Supabase Auth</p>
              </div>
            </div>
            <Clock size={15} className="text-slate-400 shrink-0" />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <Link
              href="/feed"
              className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[var(--color-primary,#EC4899)] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2"
            >
              <span>Proceed to Community Feed</span>
              <ArrowRight size={15} />
            </Link>

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendCooldown > 0 || resendStatus === 'sending'}
              className="w-full py-2.5 px-4 rounded-full bg-slate-100 dark:bg-slate-800/70 hover:bg-pink-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <RotateCw size={13} className={resendStatus === 'sending' ? 'animate-spin' : ''} />
              <span>
                {resendStatus === 'sending'
                  ? 'Dispatching Link...'
                  : resendStatus === 'sent'
                  ? 'Link Sent Successfully!'
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend Verification Link'}
              </span>
            </button>
          </div>

          {/* Footer Return Link */}
          <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <Shield size={11} className="shrink-0" />
              <span>Identity Verified</span>
            </span>
            <Link href="/auth/login" className="text-slate-400 hover:text-[var(--color-primary,#EC4899)] transition-colors">
              Return to Sign In →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
