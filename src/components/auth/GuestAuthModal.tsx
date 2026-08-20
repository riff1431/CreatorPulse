'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, X, Heart, Lock, ArrowRight, Eye, EyeOff, 
  ShieldCheck, CheckCircle2, UserCheck, AlertCircle, RefreshCw 
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { PasswordSecurity, InputSanitizer } from '@/lib/auth/security';

export interface GuestAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
}

export function GuestAuthModal({
  isOpen,
  onClose,
  title = 'Join the Community',
  subtitle = 'Sign in or create an account to unlock this exclusive content and interact with creators.',
  onSuccess,
}: GuestAuthModalProps) {
  const { login, signup } = useAuth();
  const { settings } = useSiteSettings();
  const siteName = settings.site_name || 'CreatorPulse';

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Login States
  const [email, setEmail] = useState('fan@creatorpulse.com');
  const [password, setPassword] = useState('FanPass123!');
  
  // Signup States
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  // Shared States
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleQuickFill = (roleType: 'fan' | 'creator') => {
    setErrorMessage('');
    if (roleType === 'fan') {
      setEmail('fan@creatorpulse.com');
      setPassword('FanPass123!');
    } else {
      setEmail('creator@creatorpulse.com');
      setPassword('CreatorPass123!');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const result = await login(email, password, true);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Invalid credentials');
      return;
    }

    onClose();
    if (onSuccess) onSuccess();
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const usernameCheck = InputSanitizer.validateUsername(username);
    if (!usernameCheck.isValid) {
      setErrorMessage(usernameCheck.error || 'Invalid username.');
      return;
    }

    const passEval = PasswordSecurity.evaluate(signupPassword);
    if (passEval.score < 2) {
      setErrorMessage(passEval.feedback[0] || 'Password does not meet security criteria.');
      return;
    }

    setIsLoading(true);
    const result = await signup(fullName, username, signupEmail, signupPassword, 'member');
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Signup failed.');
      return;
    }

    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      
      {/* Centered Modal Card */}
      <div 
        className="w-full max-w-md bg-white dark:bg-[#120B19] rounded-[28px] sm:rounded-[32px] shadow-2xl shadow-black/60 border border-pink-100/60 dark:border-pink-900/40 p-5 sm:p-7 relative overflow-hidden text-left space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row with Close Button */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-primary,#EC4899)] to-[#F472B6] flex items-center justify-center text-white shadow-md shadow-pink-500/25 shrink-0">
              <Sparkles size={16} />
            </div>
            <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">{siteName}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Title & Subtitle */}
        <div className="space-y-1 relative z-10">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="relative grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-full border border-slate-200/80 dark:border-slate-700/80 select-none">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(''); }}
            className={`py-1.5 px-3 rounded-full text-xs font-bold text-center transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[var(--color-primary,#EC4899)] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary,#EC4899)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(''); }}
            className={`py-1.5 px-3 rounded-full text-xs font-bold text-center transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[var(--color-primary,#EC4899)] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary,#EC4899)]'
            }`}
          >
            Quick Join
          </button>
        </div>

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-fadeIn">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Mode Forms */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            {/* Quick Test Accounts Bar */}
            <div className="flex items-center justify-between gap-1 text-[11px] bg-pink-50/60 dark:bg-slate-800/60 p-1 rounded-full border border-pink-100 dark:border-slate-700/80">
              <span className="text-slate-400 font-semibold pl-2">Demo:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickFill('fan')}
                  className={`py-0.5 px-2.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    email.includes('fan') ? 'bg-[var(--color-primary,#EC4899)] text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Fan
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('creator')}
                  className={`py-0.5 px-2.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    email.includes('creator') ? 'bg-[var(--color-primary,#EC4899)] text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Creator
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                required
                className="w-full bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 rounded-full px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary,#EC4899)] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-pink-500/20 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 rounded-full pl-3.5 pr-9 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary,#EC4899)] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--color-primary,#EC4899)] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[var(--color-primary,#EC4899)] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] active:scale-[0.99] text-white font-bold text-xs transition-all duration-200 shadow-md shadow-pink-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Continue'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (!username) {
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                    }
                  }}
                  placeholder="Jordan Lee"
                  required
                  className="w-full bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 rounded-full px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary,#EC4899)]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="jordan_lee"
                  required
                  className="w-full bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 rounded-full px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary,#EC4899)]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Email Address</label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="name@domain.com"
                required
                className="w-full bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary,#EC4899)]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="•••••••• (Min 8 chars)"
                  required
                  className="w-full bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 rounded-full pl-3.5 pr-9 py-1.5 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary,#EC4899)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--color-primary,#EC4899)] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[var(--color-primary,#EC4899)] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] active:scale-[0.99] text-white font-bold text-xs transition-all duration-200 shadow-md shadow-pink-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              <span>{isLoading ? 'Creating...' : 'Create Account & Continue'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        {/* Footer Security Badges */}
        <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-500 font-semibold">
            <ShieldCheck size={12} className="shrink-0" />
            <span>256-Bit SSL Encrypted</span>
          </span>
          <Link href="/auth/login" onClick={onClose} className="hover:text-[var(--color-primary,#EC4899)] transition-colors">
            Full Portal →
          </Link>
        </div>

      </div>
    </div>
  );
}

export default GuestAuthModal;
