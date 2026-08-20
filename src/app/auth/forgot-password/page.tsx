'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Mail, ArrowRight, CheckCircle2, 
  AlertCircle, ArrowLeft, Shield, Clock, RotateCw 
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { InputSanitizer } from '@/lib/auth/security';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { settings } = useSiteSettings();
  const siteName = settings.site_name || 'CreatorPulse';

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown countdown for resending reset emails
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    if (!InputSanitizer.isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    setIsLoading(true);

    const result = await forgotPassword(cleanEmail);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to send password reset email. Please try again.');
      setIsLoading(false);
      return;
    }

    setSubmitted(true);
    setResendCooldown(60); // 60 seconds rate limit on resends
    setIsLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage('');

    const result = await forgotPassword(email.trim().toLowerCase());
    setIsLoading(false);

    if (result.success) {
      setResendCooldown(60);
    } else {
      setErrorMessage(result.error || 'Failed to resend reset email.');
    }
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
        <div className="bg-white dark:bg-[#120B19] rounded-[28px] sm:rounded-[32px] shadow-2xl shadow-black/50 border border-pink-100/60 dark:border-pink-900/30 p-6 sm:p-8 space-y-5">
          
          {/* Header Brand */}
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 group mb-0.5">
              {settings.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={siteName} 
                  className="h-9 w-auto max-w-[170px] object-contain shrink-0" 
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--color-primary,#EC4899)] to-[#F472B6] flex items-center justify-center text-white shadow-md shadow-pink-500/25 shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{siteName}</span>
                </div>
              )}
            </Link>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {submitted ? 'Check Your Inbox' : 'Reset Your Password'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal max-w-xs">
              {submitted
                ? `We've dispatched recovery instructions to ${email}.`
                : 'Enter your verified email address and we will send you a secure password reset link.'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {submitted ? (
            <div className="space-y-4 pt-1">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto animate-bounce" />
                <p className="text-xs text-emerald-300 font-bold">Secure Reset Link Dispatched</p>
                <p className="text-[11px] text-slate-400">
                  Please click the link in your email within 60 minutes to create a new password.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[var(--color-primary,#EC4899)] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-md shadow-pink-500/25 flex items-center justify-center gap-2"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight size={15} />
                </Link>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isLoading}
                  className="w-full py-2.5 px-4 rounded-full bg-slate-100 dark:bg-slate-800/70 hover:bg-pink-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <RotateCw size={13} className={isLoading ? 'animate-spin' : ''} />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Reset Link'}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Account Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={15} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className="w-full bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary,#EC4899)] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-pink-500/20 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[var(--color-primary,#EC4899)] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Sending Instructions...' : 'Send Recovery Link'}</span>
                <ArrowRight size={15} />
              </button>

              <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-[var(--color-primary,#EC4899)] font-extrabold hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          )}

          {/* Footer Security Badges */}
          <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <Shield size={11} className="shrink-0" />
              <span>TLS 1.3 Protected</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} className="shrink-0" />
              <span>Token Validity: 60m</span>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
