'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Lock, ArrowRight, CheckCircle2, 
  AlertCircle, Eye, EyeOff, Shield, ArrowLeft, KeyRound 
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { PasswordSecurity } from '@/lib/auth/security';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { settings } = useSiteSettings();
  const siteName = settings.site_name || 'CreatorPulse';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordEvaluation = PasswordSecurity.evaluate(password);
  const isMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (passwordEvaluation.score < 2) {
      setErrorMessage(passwordEvaluation.feedback[0] || 'Password does not meet security requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    setIsLoading(true);

    const result = await resetPassword(password);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to update password. Please try again.');
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);

    setTimeout(() => {
      router.push('/auth/login');
    }, 2000);
  };

  const handleSuggestPassword = () => {
    const strong = PasswordSecurity.generateStrongPassword();
    setPassword(strong);
    setConfirmPassword(strong);
    setShowPassword(true);
    setShowConfirmPassword(true);
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
              {isSuccess ? 'Password Updated!' : 'Set New Password'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal max-w-xs">
              {isSuccess 
                ? 'Your password has been successfully reset. Redirecting you to sign in...'
                : 'Create a new, highly secure passphrase to protect your account.'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-4 pt-2">
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2.5">
                <CheckCircle2 size={36} className="text-emerald-400 mx-auto animate-bounce" />
                <p className="text-sm text-emerald-300 font-bold">Credential Updated Successfully</p>
                <p className="text-xs text-slate-400">
                  You can now log in securely with your new password credentials across all devices.
                </p>
              </div>

              <Link
                href="/auth/login"
                className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[var(--color-primary,#EC4899)] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-md shadow-pink-500/25 flex items-center justify-center gap-2"
              >
                <span>Go to Sign In</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4 pt-1">
              
              {/* New Password Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">New Password</label>
                  <button
                    type="button"
                    onClick={handleSuggestPassword}
                    className="text-[10px] font-semibold text-[var(--color-primary,#EC4899)] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Sparkles size={11} />
                    <span>Suggest Strong</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (Min 8 characters)"
                    required
                    className="w-full bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 rounded-full pl-10 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary,#EC4899)] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-pink-500/20 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--color-primary,#EC4899)] cursor-pointer p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Password Strength Meter & Criteria Checklist */}
                {password.length > 0 && (
                  <div className="space-y-1.5 pt-1 px-1 transition-all">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Strength:</span>
                      <span className={passwordEvaluation.color}>{passwordEvaluation.label}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      <div className={`h-1 rounded-full transition-all ${passwordEvaluation.score >= 1 ? (passwordEvaluation.score === 1 ? 'bg-rose-500' : passwordEvaluation.score === 2 ? 'bg-amber-500' : passwordEvaluation.score === 3 ? 'bg-blue-500' : 'bg-emerald-500') : 'bg-slate-200 dark:bg-slate-800'}`} />
                      <div className={`h-1 rounded-full transition-all ${passwordEvaluation.score >= 2 ? (passwordEvaluation.score === 2 ? 'bg-amber-500' : passwordEvaluation.score === 3 ? 'bg-blue-500' : 'bg-emerald-500') : 'bg-slate-200 dark:bg-slate-800'}`} />
                      <div className={`h-1 rounded-full transition-all ${passwordEvaluation.score >= 3 ? (passwordEvaluation.score === 3 ? 'bg-blue-500' : 'bg-emerald-500') : 'bg-slate-200 dark:bg-slate-800'}`} />
                      <div className={`h-1 rounded-full transition-all ${passwordEvaluation.score >= 4 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                    </div>

                    <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                      <span className={`flex items-center gap-1 font-medium ${passwordEvaluation.criteria.minLength ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {passwordEvaluation.criteria.minLength ? '✓' : '○'} 8+ Chars
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${passwordEvaluation.criteria.hasUpper && passwordEvaluation.criteria.hasLower ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {passwordEvaluation.criteria.hasUpper && passwordEvaluation.criteria.hasLower ? '✓' : '○'} Upper & Lower
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${passwordEvaluation.criteria.hasNumber ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {passwordEvaluation.criteria.hasNumber ? '✓' : '○'} Number
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${passwordEvaluation.criteria.hasSpecial ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {passwordEvaluation.criteria.hasSpecial ? '✓' : '○'} Symbol
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Confirm Password</label>
                  {confirmPassword.length > 0 && (
                    <span className={`text-[10px] font-bold ${isMatch ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isMatch ? '✓ Passwords Match' : '✕ Passwords Differ'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={15} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full bg-slate-50/70 dark:bg-slate-900/70 border rounded-full pl-10 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 transition-all shadow-2xs ${
                      confirmPassword.length > 0
                        ? isMatch
                          ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500/20'
                          : 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-700/80 focus:border-[var(--color-primary,#EC4899)] focus:ring-pink-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--color-primary,#EC4899)] cursor-pointer p-1"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[var(--color-primary,#EC4899)] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Updating Credentials...' : 'Update Password'}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* Footer Security Badges */}
          <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <Shield size={11} className="shrink-0" />
              <span>Encrypted Session</span>
            </span>
            <Link href="/auth/login" className="text-slate-400 hover:text-[var(--color-primary,#EC4899)] transition-colors">
              Return to Login →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
