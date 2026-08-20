'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { GuestGuard } from '@/components/auth/RouteGuards';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Sparkles, ArrowRight, UserCheck, 
  Eye, EyeOff, Shield, AlertCircle, Ban, ArrowLeft,
  Loader2, CheckCircle2, XCircle, RefreshCw,
  Heart, Crown, User
} from 'lucide-react';
import { Alert } from '../components/Alert';
import { CategorySelect } from '../components/CategorySelect';
import { useAuth } from '@/lib/auth/auth-context';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { UserRole } from '@/lib/supabase/store';
import { getPostLoginDestination } from '@/lib/auth/redirect-utils';
import { PasswordSecurity, RateLimiter, InputSanitizer } from '@/lib/auth/security';

export function UnifiedAuthPage({ initialMode = 'login' }: { initialMode?: 'login' | 'signup' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup } = useAuth();
  const { settings } = useSiteSettings();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Login Form States
  const [email, setEmail] = useState('fan@creatorpulse.com');
  const [password, setPassword] = useState('FanPass123!');
  const [rememberMe, setRememberMe] = useState(true);

  // Signup Form States
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [category, setCategory] = useState('Education & Tech');

  // Username Auto Generation & Verification States
  const [isUsernameManuallyEdited, setIsUsernameManuallyEdited] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameFeedback, setUsernameFeedback] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

  // Slugify Helper to create auto username from full name
  const generateUsernameFromFullName = (name: string) => {
    const slug = name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    return slug;
  };

  const handleFullNameChange = (val: string) => {
    setFullName(val);
    if (!isUsernameManuallyEdited) {
      const autoUser = generateUsernameFromFullName(val);
      setUsername(autoUser);
    }
  };

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    setIsUsernameManuallyEdited(true);
  };

  const handleAutoSuggestUsername = () => {
    const base = fullName.trim() ? generateUsernameFromFullName(fullName) : 'user';
    const randNum = Math.floor(100 + Math.random() * 900);
    const newUsername = `${base || 'user'}_${randNum}`;
    setUsername(newUsername);
    setIsUsernameManuallyEdited(false);
  };

  // Rate Limit Lockout Timer State
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Countdown timer for lockout
  React.useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Real-time Password Strength & Suggestion Evaluation via Centralized Security Engine
  const evaluatePasswordStrength = (pass: string) => {
    return PasswordSecurity.evaluate(pass);
  };

  const handleGenerateStrongPassword = () => {
    const pass = PasswordSecurity.generateStrongPassword();
    setSignupPassword(pass);
    setShowPassword(true);
  };

  // Real-time debounced server availability check
  React.useEffect(() => {
    if (mode !== 'signup') return;
    const cleaned = username.trim().toLowerCase();

    if (!cleaned) {
      setUsernameStatus('idle');
      setUsernameFeedback('');
      setUsernameSuggestions([]);
      return;
    }

    if (cleaned.length < 3) {
      setUsernameStatus('invalid');
      setUsernameFeedback('Username must be at least 3 characters.');
      setUsernameSuggestions([]);
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(cleaned)}`);
        const data = await res.json();
        if (data.available) {
          setUsernameStatus('available');
          setUsernameFeedback('Username is available!');
          setUsernameSuggestions([]);
        } else {
          setUsernameStatus(data.reason?.includes('taken') ? 'taken' : 'invalid');
          setUsernameFeedback(data.reason || 'Username is not available.');
          setUsernameSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error('Username check error', err);
        setUsernameStatus('available');
        setUsernameFeedback('');
        setUsernameSuggestions([]);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, mode]);

  // Shared UI States
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialMessage, setSocialMessage] = useState('');

  const reason = searchParams?.get('reason');
  const redirectUrl = searchParams?.get('redirect');

  const handleQuickFill = (type: 'creator' | 'member' | 'suspended') => {
    setErrorMessage('');
    if (type === 'creator') {
      setEmail('creator@creatorpulse.com');
      setPassword('CreatorPass123!');
    } else if (type === 'suspended') {
      setEmail('suspended@creatorpulse.com');
      setPassword('SuspPass123!');
    } else {
      setEmail('fan@creatorpulse.com');
      setPassword('FanPass123!');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (lockoutSeconds > 0) {
      setErrorMessage(`Account temporarily locked. Please wait ${lockoutSeconds} seconds.`);
      return;
    }

    setIsSubmitting(true);

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in all credentials.');
      setIsSubmitting(false);
      return;
    }

    const result = await login(email, password, rememberMe);

    if (!result.success) {
      if (result.isLocked && result.remainingSeconds) {
        setLockoutSeconds(result.remainingSeconds);
        setErrorMessage(`Too many failed attempts. Login locked for ${result.remainingSeconds}s.`);
      } else {
        setErrorMessage(result.error || 'Invalid credentials');
      }
      setIsSubmitting(false);
      return;
    }

    const authedRole = result.user?.role || 'member';
    router.push(getPostLoginDestination(authedRole, redirectUrl));
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (!fullName.trim() || !username.trim() || !signupEmail.trim()) {
      setErrorMessage('Please fill out all required fields.');
      setIsSubmitting(false);
      return;
    }

    const usernameCheck = InputSanitizer.validateUsername(username);
    if (!usernameCheck.isValid) {
      setErrorMessage(usernameCheck.error || 'Invalid username.');
      setIsSubmitting(false);
      return;
    }

    const passEval = PasswordSecurity.evaluate(signupPassword);
    if (passEval.score < 2) {
      setErrorMessage(passEval.feedback[0] || 'Password does not meet minimum security requirements.');
      setIsSubmitting(false);
      return;
    }

    const result = await signup(fullName, username, signupEmail, signupPassword, role, category);

    if (!result.success) {
      setErrorMessage(result.error || 'Signup failed. Please try again.');
      setIsSubmitting(false);
      return;
    }

    if (result.error === 'Check email') {
      router.push('/auth/verify');
      return;
    }

    const createdRole = result.user?.role || role;
    if (createdRole === 'member' || createdRole === 'creator') {
      router.push('/onboarding');
    } else {
      router.push(getPostLoginDestination(createdRole, redirectUrl));
    }
  };

  const handleSocialAuth = (provider: string) => {
    setSocialMessage(`Connecting with ${provider}... Please proceed with email authorization below.`);
    setTimeout(() => setSocialMessage(''), 4000);
  };

  const switchMode = (newMode: 'login' | 'signup') => {
    setErrorMessage('');
    setSocialMessage('');
    setMode(newMode);
  };

  let reasonAlert = null;
  if (reason === 'unauthorized') {
    reasonAlert = {
      title: "Authorization Required",
      message: "Your current account level does not have permissions to view that page. Please sign in with an authorized account."
    };
  } else if (reason === 'blocked') {
    reasonAlert = {
      title: "Account Suspended",
      message: "This account has been restricted or banned by the platform administrator due to policy violations."
    };
  } else if (reason) {
    reasonAlert = {
      title: "Authentication Required",
      message: "Please authenticate with your credentials to access the requested view."
    };
  }

  const siteName = settings.site_name || 'CreatorPulse';

  return (
    <div className="w-full max-w-[940px] max-h-[calc(100vh-1rem)] sm:max-h-[calc(100dvh-2rem)] bg-white dark:bg-[#120B19] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] shadow-2xl shadow-black/40 border border-pink-100/60 dark:border-pink-900/30 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10 my-auto">
      
      {/* Left Visual Banner Card - Desktop View */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-[#0F0715] flex-col justify-between p-6 lg:p-7 select-none overflow-hidden h-full">
        
        {/* Top Text Header */}
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight text-white leading-[1.2]">
            Simplify The Process.<br />
            Supercharge The Results.
          </h2>
          <p className="text-xs text-pink-200/70 font-normal leading-relaxed max-w-[240px]">
            Focus On The Big Picture While We Automate The Daily Details.
          </p>
        </div>

        {/* Dynamic Vertical Light Curtains Graphic */}
        <div className="absolute bottom-0 inset-x-0 h-[65%] flex items-end justify-between px-4 pb-0 pointer-events-none opacity-90">
          <div className="w-[8%] h-[85%] bg-gradient-to-t from-[var(--color-primary,#EC4899)] via-[#F43F5E] to-transparent rounded-t-full shadow-[0_0_20px_rgba(236,72,153,0.6)]" />
          <div className="w-[8%] h-[68%] bg-gradient-to-t from-[#DB2777] via-[#FB7185] to-transparent rounded-t-full shadow-[0_0_25px_rgba(244,114,182,0.7)]" />
          <div className="w-[8%] h-[100%] bg-gradient-to-t from-[var(--color-primary,#EC4899)] via-[#E11D48] to-transparent rounded-t-full shadow-[0_0_30px_rgba(236,72,153,0.8)]" />
          <div className="w-[8%] h-[78%] bg-gradient-to-t from-[#DB2777] via-[#F43F5E] to-transparent rounded-t-full shadow-[0_0_20px_rgba(244,114,182,0.6)]" />
          <div className="w-[8%] h-[92%] bg-gradient-to-t from-[var(--color-primary,#EC4899)] via-[#FB7185] to-transparent rounded-t-full shadow-[0_0_25px_rgba(236,72,153,0.7)]" />
          <div className="w-[8%] h-[72%] bg-gradient-to-t from-[#DB2777] via-[#E11D48] to-transparent rounded-t-full shadow-[0_0_20px_rgba(244,114,182,0.6)]" />
          <div className="w-[8%] h-[98%] bg-gradient-to-t from-[var(--color-primary,#EC4899)] via-[#F43F5E] to-transparent rounded-t-full shadow-[0_0_30px_rgba(236,72,153,0.8)]" />
          <div className="w-[8%] h-[76%] bg-gradient-to-t from-[#DB2777] via-[#FB7185] to-transparent rounded-t-full shadow-[0_0_20px_rgba(244,114,182,0.6)]" />
          <div className="w-[8%] h-[88%] bg-gradient-to-t from-[var(--color-primary,#EC4899)] via-[#E11D48] to-transparent rounded-t-full shadow-[0_0_25px_rgba(236,72,153,0.7)]" />
        </div>
      </div>

      {/* Mobile Compact Header Bar (< 1024px) */}
      <div className="lg:hidden p-3.5 sm:p-4 bg-[#0F0715] flex items-center justify-between relative overflow-hidden select-none border-b border-pink-900/20">
        <div className="relative z-10">
          <h2 className="text-sm font-extrabold text-white tracking-tight">
            Simplify The Process. Supercharge Results.
          </h2>
          <p className="text-[10px] text-pink-200/70 font-normal">
            Automating Daily Details For You.
          </p>
        </div>
        <div className="w-16 h-8 bg-gradient-to-r from-[var(--color-primary,#EC4899)] to-[#F43F5E] rounded-full blur-lg opacity-40 pointer-events-none" />
      </div>

      {/* Right Form Card */}
      <div className="lg:col-span-7 flex flex-col justify-center p-3.5 sm:p-5 lg:p-6 space-y-2.5 sm:space-y-3 overflow-y-auto">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-1.5">
          <Link href="/" className="inline-flex items-center gap-2 group mb-0.5">
            {settings.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt={siteName} 
                className="h-8 sm:h-10 w-auto max-w-[170px] object-contain shrink-0" 
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-primary,#EC4899)] to-[#F472B6] flex items-center justify-center text-white shadow-md shadow-pink-500/25 shrink-0">
                  <Sparkles size={16} />
                </div>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{siteName}</span>
              </div>
            )}
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {mode === 'login' ? 'Log in to your account' : 'Create your account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
            {mode === 'login' ? 'Welcome back! Fill in your details to get you back in.' : 'Fill in your details below to get started with your account.'}
          </p>
        </div>

        {/* Mode Switcher Tabs (Sign In / Sign Up) */}
        <div className="relative grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-full border border-slate-200/80 dark:border-slate-700/80 select-none overflow-hidden">
          {/* Smooth Sliding Active Pill Indicator */}
          <div
            className={`absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-[var(--color-primary,#EC4899)] shadow-xs transition-all duration-300 ease-out ${
              mode === 'login' ? 'left-1' : 'left-[calc(50%+0.125rem)]'
            }`}
          />
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`relative z-10 py-1.5 px-3 rounded-full text-xs font-bold text-center transition-colors duration-300 cursor-pointer ${
              mode === 'login'
                ? 'text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary,#EC4899)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`relative z-10 py-1.5 px-3 rounded-full text-xs font-bold text-center transition-colors duration-300 cursor-pointer ${
              mode === 'signup'
                ? 'text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary,#EC4899)]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Lockout Warning Banner */}
        {lockoutSeconds > 0 && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-400 flex items-center gap-3 animate-pulse">
            <Ban size={18} className="shrink-0 text-rose-500" />
            <div>
              <p className="font-bold text-rose-300">Brute-Force Rate Limit Active</p>
              <p className="text-[11px] text-rose-400/90">
                Too many failed attempts. Try again in <span className="font-mono font-bold text-white bg-rose-900/60 px-1.5 py-0.5 rounded">{lockoutSeconds}s</span>
              </p>
            </div>
          </div>
        )}

        {/* Reason Alert */}
        {reasonAlert && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{reasonAlert.title}</p>
              <p className="text-[11px] mt-0.5 opacity-90">{reasonAlert.message}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <Alert variant="error" onDismiss={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {socialMessage && (
          <Alert variant="info" onDismiss={() => setSocialMessage('')}>
            {socialMessage}
          </Alert>
        )}

        {/* Dynamic Mode Form */}
        {mode === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {/* Quick Test Credentials Bar */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-[11px] px-1">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Quick Test Credentials:</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 bg-pink-50/60 dark:bg-slate-800/60 p-1.5 rounded-full border border-pink-100 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => handleQuickFill('member')}
                  className={`py-1 px-2 rounded-full text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    email.includes('fan') || email.includes('alex')
                      ? 'bg-[var(--color-primary,#EC4899)] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary,#EC4899)]'
                  }`}
                >
                  <UserCheck size={12} />
                  <span>Fan</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('creator')}
                  className={`py-1 px-2 rounded-full text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    email.includes('creator')
                      ? 'bg-[var(--color-primary,#EC4899)] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary,#EC4899)]'
                  }`}
                >
                  <Eye size={12} />
                  <span>Creator</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('suspended')}
                  className={`py-1 px-2 rounded-full text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    email.includes('suspended')
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-rose-600'
                  }`}
                >
                  <Ban size={12} />
                  <span>Blocked</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Heymaxwell@gmail.com"
                className="w-full bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary,#EC4899)] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-pink-500/20 transition-all shadow-2xs"
                required
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
                  className="w-full bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 rounded-full pl-4 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary,#EC4899)] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-pink-500/20 transition-all shadow-2xs"
                  required
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
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[var(--color-primary,#EC4899)] focus:ring-[var(--color-primary,#EC4899)] cursor-pointer"
                />
                <span className="text-slate-600 dark:text-slate-400 font-medium text-[11px] sm:text-xs">Remember Me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-[var(--color-primary,#EC4899)] hover:text-[#DB2777] font-semibold text-[11px] sm:text-xs hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || lockoutSeconds > 0}
              className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[var(--color-primary,#EC4899)] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              <span>{isSubmitting ? 'Logging in...' : lockoutSeconds > 0 ? `Locked (${lockoutSeconds}s)` : 'Log In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={handleSignupSubmit} className="space-y-3">
            {/* Role Selector */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between px-1 flex-wrap gap-1">
                <label className="block font-bold text-slate-700 dark:text-slate-200 text-xs">I am joining as:</label>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[var(--color-primary,#EC4899)] flex items-center gap-1">
                  {role === 'member' ? (
                    <>
                      <Heart size={11} className="fill-current text-pink-500 animate-pulse shrink-0" />
                      <span className="truncate">Signing up as Fan User</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={11} className="text-pink-500 animate-spin shrink-0" />
                      <span className="truncate">Signing up as Creator User</span>
                    </>
                  )}
                </span>
              </div>

              {/* Segmented Control with Smooth Sliding Active Indicator */}
              <div className="relative grid grid-cols-2 gap-1 bg-pink-50/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-pink-100 dark:border-slate-700/80 shadow-inner select-none overflow-hidden">
                <div
                  className={`absolute inset-y-1.5 w-[calc(50%-0.375rem)] rounded-xl bg-gradient-to-r ${
                    role === 'member'
                      ? 'from-[var(--color-primary,#EC4899)] to-[#F43F5E] shadow-md shadow-pink-500/25 ring-1 ring-pink-400/40'
                      : 'from-[#DB2777] via-[var(--color-primary,#EC4899)] to-[#E11D48] shadow-md shadow-pink-500/25 ring-1 ring-pink-400/40'
                  } transition-all duration-300 ease-out ${
                    role === 'member' ? 'left-1.5' : 'left-[calc(50%+0.1875rem)]'
                  }`}
                />

                {/* Fan User Button */}
                <button
                  type="button"
                  onClick={() => setRole('member')}
                  className={`relative z-10 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-colors duration-300 cursor-pointer flex items-center justify-center sm:justify-start gap-2 group min-w-0 ${
                    role === 'member'
                      ? 'text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary,#EC4899)] dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1 rounded-full shrink-0 transition-colors duration-300 ${
                    role === 'member' ? 'bg-white/20 text-white' : 'bg-pink-100/80 dark:bg-slate-700 text-[var(--color-primary,#EC4899)]'
                  }`}>
                    <Heart size={13} className={`transition-transform duration-300 ${role === 'member' ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="leading-tight truncate">Fan User</span>
                    <span className={`text-[9px] font-normal truncate ${role === 'member' ? 'text-pink-100 opacity-90' : 'text-slate-400 dark:text-slate-500'}`}>
                      Explore & Support
                    </span>
                  </div>
                </button>

                {/* Creator User Button */}
                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className={`relative z-10 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-colors duration-300 cursor-pointer flex items-center justify-center sm:justify-start gap-2 group min-w-0 ${
                    role === 'creator'
                      ? 'text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary,#EC4899)] dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1 rounded-full shrink-0 transition-colors duration-300 ${
                    role === 'creator' ? 'bg-white/20 text-white' : 'bg-pink-100/80 dark:bg-slate-700 text-[var(--color-primary,#EC4899)]'
                  }`}>
                    <Sparkles size={13} className={`transition-transform duration-300 ${role === 'creator' ? 'text-yellow-300 animate-spin' : 'group-hover:rotate-12'}`} />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="leading-tight truncate">Creator User</span>
                    <span className={`text-[9px] font-normal truncate ${role === 'creator' ? 'text-pink-100 opacity-90' : 'text-slate-400 dark:text-slate-500'}`}>
                      Publish & Earn
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => handleFullNameChange(e.target.value)}
                  placeholder="Jordan Lee"
                  className="w-full bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary,#EC4899)] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-pink-500/20 transition-all shadow-2xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Username</label>
                  <button
                    type="button"
                    onClick={handleAutoSuggestUsername}
                    title="Auto-suggest unique username"
                    className="text-[10px] font-semibold text-[var(--color-primary,#EC4899)] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <RefreshCw size={10} />
                    <span>Auto Suggest</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="jordan_lee"
                    className={`w-full bg-slate-50/70 dark:bg-slate-900/70 border rounded-full pl-4 pr-10 py-2 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 transition-all shadow-2xs ${
                      usernameStatus === 'available'
                        ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500/20'
                        : usernameStatus === 'taken' || usernameStatus === 'invalid'
                        ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-700/80 focus:border-[var(--color-primary,#EC4899)] focus:ring-pink-500/20'
                    }`}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 pointer-events-none">
                    {usernameStatus === 'checking' && (
                      <Loader2 size={14} className="animate-spin text-pink-500" />
                    )}
                    {usernameStatus === 'available' && (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    )}
                    {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                      <XCircle size={14} className="text-rose-500" />
                    )}
                  </div>
                </div>

                {/* Status Indicator & Suggestions */}
                {usernameStatus !== 'idle' && (
                  <div className="text-[10px] space-y-0.5 pt-0.5 px-1">
                    {usernameStatus === 'available' && (
                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        ✓ {usernameFeedback}
                      </p>
                    )}
                    {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                      <p className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                        ✕ {usernameFeedback}
                      </p>
                    )}

                    {usernameSuggestions.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        <span className="text-slate-400 dark:text-slate-500 font-medium">Try:</span>
                        {usernameSuggestions.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => {
                              setUsername(sug);
                              setIsUsernameManuallyEdited(true);
                            }}
                            className="bg-pink-50 dark:bg-pink-950/50 hover:bg-pink-100 dark:hover:bg-pink-900/60 text-[var(--color-primary,#EC4899)] border border-pink-200 dark:border-pink-800/60 rounded-full px-2 py-0.5 font-bold transition-colors cursor-pointer"
                          >
                            @{sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Email Address</label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="jordan@domain.com"
                className="w-full bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary,#EC4899)] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-pink-500/20 transition-all shadow-2xs"
                required
              />
              {InputSanitizer.isDisposableEmail(signupEmail) && (
                <p className="text-[10px] text-amber-500 dark:text-amber-400 font-semibold px-1 pt-0.5 flex items-center gap-1">
                  <AlertCircle size={11} />
                  <span>Temporary burner email detected. Account recovery links may be lost.</span>
                </p>
              )}
            </div>

            {/* Smooth Expandable Creator Category Accordion Animation */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              role === 'creator' ? 'max-h-24 opacity-100 space-y-1' : 'max-h-0 opacity-0 pointer-events-none'
            }`}>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Sparkles size={12} className="text-[var(--color-primary,#EC4899)]" />
                <span>Primary Creator Category</span>
              </label>
              <CategorySelect value={category} onChange={setCategory} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={handleGenerateStrongPassword}
                  title="Generate a strong password"
                  className="text-[10px] font-semibold text-[var(--color-primary,#EC4899)] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Sparkles size={11} />
                  <span>Suggest Password</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="•••••••• (Min 8 characters)"
                  className="w-full bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 rounded-full pl-4 pr-10 py-2 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary,#EC4899)] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-pink-500/20 transition-all shadow-2xs"
                  required
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

              {/* Real-Time Password Strength & Criteria Checklist */}
              {signupPassword.length > 0 && (() => {
                const { score, label, color, criteria, feedback } = evaluatePasswordStrength(signupPassword);
                return (
                  <div className="space-y-1.5 pt-1 px-1 transition-all">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Security Strength:</span>
                      <span className={color}>{label}</span>
                    </div>

                    {/* Strength Progress Bars */}
                    <div className="grid grid-cols-4 gap-1">
                      <div className={`h-1 rounded-full transition-all ${score >= 1 ? (score === 1 ? 'bg-rose-500' : score === 2 ? 'bg-amber-500' : score === 3 ? 'bg-blue-500' : 'bg-emerald-500') : 'bg-slate-200 dark:bg-slate-800'}`} />
                      <div className={`h-1 rounded-full transition-all ${score >= 2 ? (score === 2 ? 'bg-amber-500' : score === 3 ? 'bg-blue-500' : 'bg-emerald-500') : 'bg-slate-200 dark:bg-slate-800'}`} />
                      <div className={`h-1 rounded-full transition-all ${score >= 3 ? (score === 3 ? 'bg-blue-500' : 'bg-emerald-500') : 'bg-slate-200 dark:bg-slate-800'}`} />
                      <div className={`h-1 rounded-full transition-all ${score >= 4 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                    </div>

                    {/* Criteria Checklist Pills */}
                    <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                      <span className={`flex items-center gap-1 font-medium ${criteria.minLength ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {criteria.minLength ? '✓' : '○'} 8+ Characters
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${criteria.hasUpper && criteria.hasLower ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {criteria.hasUpper && criteria.hasLower ? '✓' : '○'} Upper & Lowercase
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${criteria.hasNumber ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {criteria.hasNumber ? '✓' : '○'} Numeric Digit
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${criteria.hasSpecial ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {criteria.hasSpecial ? '✓' : '○'} Special Symbol
                      </span>
                    </div>

                    {/* Real-time Feedback */}
                    {feedback.length > 0 && score < 3 && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                        <span className="text-pink-500 font-bold">💡 Tip:</span> {feedback[0]}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-5 rounded-full bg-gradient-to-r from-[var(--color-primary,#EC4899)] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-md shadow-pink-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1 group"
            >
              <span>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </span>
              <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* Social Login Divider */}
        <div className="relative flex items-center justify-center my-1.5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <span className="relative px-2.5 bg-white dark:bg-[#120B19] text-[10px] sm:text-[11px] font-medium text-slate-400">
            Or continue with
          </span>
        </div>

        {/* Compact Side-by-Side Social Auth Buttons (2-Column Grid) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleSocialAuth('Google')}
            className="py-2 px-3 rounded-full bg-slate-100/80 dark:bg-slate-800/80 hover:bg-pink-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors border border-transparent hover:border-pink-200 dark:hover:border-slate-700 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleSocialAuth('Apple')}
            className="py-2 px-3 rounded-full bg-slate-100/80 dark:bg-slate-800/80 hover:bg-pink-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors border border-transparent hover:border-pink-200 dark:hover:border-slate-700 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.09c.68-.83 1.14-1.99 1.01-3.15-.98.04-2.17.65-2.87 1.47-.63.73-1.18 1.91-1.03 3.05 1.1.09 2.22-.54 2.89-1.37z" />
            </svg>
            <span>Apple</span>
          </button>
        </div>

        {/* Switch Link */}
        <div className="text-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal pt-[1px]">
          {mode === 'login' ? (
            <>
              Dont have an account?{' '}
              <button 
                type="button" 
                onClick={() => switchMode('signup')}
                className="text-[var(--color-primary,#EC4899)] font-extrabold hover:underline cursor-pointer"
              >
                Create One
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => switchMode('login')}
                className="text-[var(--color-primary,#EC4899)] font-extrabold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}
        </div>

        {/* Security Trust Badges & Dedicated Staff Gateway Link */}
        <div className="pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap text-[10px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <Shield size={11} className="shrink-0" />
              <span>256-Bit SSL</span>
            </span>
            <span className="text-slate-600 dark:text-slate-700">•</span>
            <span className="text-slate-400">Rate-Shield Active</span>
          </div>
          <Link 
            href="/admin/login"
            className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 hover:text-[var(--color-primary,#EC4899)] font-medium transition-colors bg-slate-50 dark:bg-slate-900/50 px-2.5 py-0.5 rounded-full border border-slate-200/80 dark:border-slate-800 hover:border-pink-300 shadow-2xs"
          >
            <span>Staff Portal →</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export function LoginPage() {
  return (
    <GuestGuard>
      <div className="h-screen max-h-screen sm:h-dvh w-full bg-[#0B0612] flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden relative transition-colors duration-200 selection:bg-[var(--color-primary,#EC4899)] selection:text-white">
        
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
          <div className="p-6 text-center text-xs text-slate-400 font-bold relative z-10">
            Loading authentication portal...
          </div>
        }>
          <UnifiedAuthPage initialMode="login" />
        </Suspense>
      </div>
    </GuestGuard>
  );
}

export default LoginPage;



