'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Lock, Mail, Eye, EyeOff, Home, ShieldCheck, 
  AlertCircle, ShieldAlert, Key, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { useTheme } from '@/lib/extensions/theme-engine';
import { AdminGuestGuard } from '@/components/auth/RouteGuards';

/**
 * Left Character Illustration Component
 * Recreates the girl on pedestal with dynamic laptop accent color,
 * box with arrow, and radiating sparks.
 */
function CharacterIllustration({ primaryColor }: { primaryColor: string }) {
  return (
    <div className="relative w-44 h-48 sm:w-56 sm:h-60 shrink-0 pointer-events-none select-none">
      <svg viewBox="0 0 240 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Sparks above head */}
        <line x1="85" y1="52" x2="72" y2="38" stroke="#1E1E24" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="97" y1="45" x2="97" y2="28" stroke="#1E1E24" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="110" y1="52" x2="122" y2="38" stroke="#1E1E24" strokeWidth="2.5" strokeLinecap="round" />

        {/* Left White Box with Arrow */}
        <rect x="35" y="165" width="55" height="65" fill="#FFFFFF" stroke="#1E1E24" strokeWidth="2" rx="2" />
        {/* Arrow path */}
        <path d="M50 205 Q 65 195 68 177" stroke="#1E1E24" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M62 176 L 68 175 L 72 181" stroke="#1E1E24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Yellow Stool / Pedestal */}
        <rect x="90" y="145" width="50" height="85" fill="#F8D376" stroke="#1E1E24" strokeWidth="2" rx="2" />

        {/* Character Body & Clothes */}
        {/* Legs & Shoes */}
        <path d="M102 165 C 105 178 110 190 120 200 L 140 200 C 135 185 125 170 120 155 Z" fill="#FFFFFF" stroke="#1E1E24" strokeWidth="2" />
        <path d="M120 200 L 145 200 C 147 205 142 215 135 215 L 122 215 Z" fill="#FFFFFF" stroke="#1E1E24" strokeWidth="2" />
        {/* Black Shoes */}
        <path d="M135 210 L 152 218 C 153 222 147 225 140 225 L 130 216 Z" fill="#1E1E24" />
        <path d="M122 205 L 132 215 C 130 220 125 222 120 218 Z" fill="#1E1E24" />

        {/* Shirt / Torso (Black with white dashed pattern) */}
        <path d="M85 110 C 80 125 80 145 92 148 C 105 148 118 135 118 120 C 115 105 100 100 85 110 Z" fill="#1E1E24" stroke="#1E1E24" strokeWidth="2" />
        {/* Shirt pattern dashes */}
        <line x1="88" y1="120" x2="92" y2="124" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="100" y1="115" x2="104" y2="119" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="95" y1="130" x2="99" y2="134" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="107" y1="128" x2="111" y2="132" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="88" y1="138" x2="92" y2="142" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

        {/* Arms holding laptop */}
        <path d="M98 120 C 105 130 115 135 125 130" stroke="#1E1E24" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M112 122 C 118 132 128 135 138 130" stroke="#1E1E24" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Dynamic Laptop Accent */}
        <path d="M142 108 L 148 134 L 132 137 L 126 112 Z" fill={primaryColor} stroke={primaryColor} strokeWidth="2" />
        <line x1="130" y1="135" x2="148" y2="133" stroke="#1E1E24" strokeWidth="2.5" strokeLinecap="round" />

        {/* Head & Face */}
        <circle cx="102" cy="85" r="12" fill="#FFFFFF" stroke="#1E1E24" strokeWidth="2" />
        {/* Hair with top bun */}
        <path d="M90 85 C 88 72 100 68 108 72 C 114 74 116 85 106 88 C 100 89 90 92 82 98 C 80 88 84 82 90 85 Z" fill="#1E1E24" />
        <circle cx="92" cy="70" r="7" fill="#1E1E24" />
      </svg>
    </div>
  );
}

/**
 * Right Chart Blocks Illustration Component
 * Recreates the cloud silhouette, white block, and tall yellow bar chart.
 */
function ChartIllustration() {
  return (
    <div className="relative w-40 h-48 sm:w-52 sm:h-60 shrink-0 pointer-events-none select-none">
      <svg viewBox="0 0 220 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft Cloud / Bush Silhouette in background */}
        <path 
          d="M75 140 C 70 120 90 100 110 105 C 125 90 150 95 160 110 C 175 110 185 125 180 145 C 190 155 185 175 170 180" 
          stroke="#1E1E24" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* White Bar Block (Middle Height) */}
        <rect x="25" y="150" width="55" height="80" fill="#FFFFFF" stroke="#1E1E24" strokeWidth="2" rx="2" />

        {/* Yellow Bar Block (Tall) */}
        <rect x="80" y="115" width="58" height="115" fill="#F8D376" stroke="#1E1E24" strokeWidth="2" rx="2" />
      </svg>
    </div>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { settings } = useSiteSettings();
  const { activeTheme } = useTheme();

  // Dynamic Theme Primary Color (defaults to Pink #EC4899 if unset)
  const primaryColor = activeTheme?.tokens?.primary || '#EC4899';

  const [email, setEmail] = useState('admin@creatorpulse.com');
  const [password, setPassword] = useState('AdminPass123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuickFill, setShowQuickFill] = useState(false);

  const reason = searchParams?.get('reason');
  const redirectUrl = searchParams?.get('redirect');

  const handleQuickFill = (roleType: 'superadmin' | 'admin' | 'moderator') => {
    setErrorMessage('');
    if (roleType === 'superadmin') {
      setEmail('superadmin@creatorpulse.com');
      setPassword('SuperPass123!');
    } else if (roleType === 'admin') {
      setEmail('admin@creatorpulse.com');
      setPassword('AdminPass123!');
    } else if (roleType === 'moderator') {
      setEmail('moderator@creatorpulse.com');
      setPassword('ModPass123!');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter your administrator credentials.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password, rememberMe);

      if (!result.success || !result.user) {
        setErrorMessage(result.error || 'Authentication failed. Please verify your administrative credentials.');
        setIsSubmitting(false);
        return;
      }

      const userRole = result.user.role;
      const isAdminRole = userRole === 'admin' || userRole === 'super_admin' || userRole === 'moderator';

      // Strictly enforce administrative clearance boundary
      if (!isAdminRole) {
        // Clear local cookies and state without route push to preserve error alert
        if (typeof document !== 'undefined') {
          document.cookie = 'creatorpulse_role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure';
          document.cookie = 'creatorpulse_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure';
          document.cookie = 'creatorpulse_user_profile=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure';
        }
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('creatorpulse_auth_user');
          localStorage.removeItem('creatorpulse_active_role');
        }
        setErrorMessage('Access Denied: Standard creator or fan accounts are not authorized to access the Admin Control Center.');
        setIsSubmitting(false);
        return;
      }

      // Route to admin destination
      if (redirectUrl && redirectUrl.startsWith('/admin') && !redirectUrl.startsWith('/admin/login')) {
        router.push(redirectUrl);
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected authentication error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1060px] min-h-[640px] bg-white rounded-[36px] sm:rounded-[44px] shadow-[0_20px_70px_rgba(0,0,0,0.07)] border border-slate-200/70 p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
      
      {/* Top Header Row: Brand on Left, Circular Action Icons on Right */}
      <div className="flex items-center justify-between w-full z-20">
        {/* Left: Brand Icon & Text */}
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Dynamic brand icon using primary color */}
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <path 
                d="M18 4 C 10.27 4 4 10.27 4 18 C 4 25.73 10.27 32 18 32 C 24.1 32 29.3 28.1 31.2 22.5" 
                stroke={primaryColor} 
                strokeWidth="4" 
                strokeLinecap="round" 
              />
              <circle cx="18" cy="18" r="4.5" fill={primaryColor} />
            </svg>
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
            {settings.site_name ? `${settings.site_name}.` : 'Red.'}
          </span>
        </Link>

        {/* Right: Security Clearance & Go to Home Actions */}
        <div className="flex items-center gap-3">
          {/* Security Clearance Quick-Fill Button with subtle breathing loop */}
          <button 
            type="button"
            onClick={() => setShowQuickFill(!showQuickFill)}
            title="Administrative Security & Test Accounts"
            className="w-10 h-10 rounded-full border border-slate-200/80 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer relative group animate-subtle-pulse"
          >
            <ShieldCheck size={18} strokeWidth={2} style={{ color: primaryColor }} />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-ping opacity-75" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>
          
          {/* Go to Home Button with text and home icon */}
          <Link 
            href="/"
            title="Return to Public Homepage"
            className="h-10 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm group active:scale-[0.98] border border-slate-800"
          >
            <Home size={15} strokeWidth={2} className="text-slate-200 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-medium">Go to Home</span>
          </Link>
        </div>
      </div>

      {/* Quick Fill Dropdown Panel for Developer Testing */}
      {showQuickFill && (
        <div className="absolute top-20 right-6 sm:right-10 z-40 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 w-64 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 border-b border-slate-100 pb-1.5">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} style={{ color: primaryColor }} />
              Security Clearance:
            </span>
            <span className="text-[10px] font-mono font-bold" style={{ color: primaryColor }}>1-CLICK</span>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <button
              type="button"
              onClick={() => { handleQuickFill('superadmin'); setShowQuickFill(false); }}
              className="text-left py-1.5 px-2.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>👑 Super Admin</span>
              <span className="text-[10px] text-slate-400 font-mono">superadmin</span>
            </button>
            <button
              type="button"
              onClick={() => { handleQuickFill('admin'); setShowQuickFill(false); }}
              className="text-left py-1.5 px-2.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>🛡️ Platform Lead</span>
              <span className="text-[10px] text-slate-400 font-mono">admin</span>
            </button>
            <button
              type="button"
              onClick={() => { handleQuickFill('moderator'); setShowQuickFill(false); }}
              className="text-left py-1.5 px-2.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>⚖️ Moderator</span>
              <span className="text-[10px] text-slate-400 font-mono">moderator</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Center Floating Card */}
      <div className="my-auto py-8 z-20 flex justify-center items-center w-full">
        <div className="w-full max-w-[390px] bg-white rounded-[28px] sm:rounded-[32px] p-7 sm:p-9 shadow-[0_12px_45px_rgba(0,0,0,0.06)] border border-slate-100/90 text-left space-y-5">
          
          {/* Card Headline */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 leading-[1.15] tracking-tight">
              Lets<br />
              Start Learning
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Please login to continue
            </p>
          </div>

          {/* Reason Alert (if blocked or unauthorized) */}
          {reason === 'blocked' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <ShieldAlert size={15} className="shrink-0 mt-0.5" />
              <span>This administrative account has been restricted by system policy.</span>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-fadeIn">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-3.5">
            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                <Mail size={16} strokeWidth={1.8} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-[#F5F5F7] border border-transparent focus:border-slate-300 focus:bg-white rounded-2xl text-xs text-slate-800 placeholder-slate-400 font-medium transition-all outline-none"
              />
            </div>

            {/* Password Field with Functional Interactive Toggle */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                <Lock size={16} strokeWidth={1.8} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your Password"
                required
                className="w-full pl-11 pr-12 py-3.5 bg-[#F5F5F7] border border-transparent focus:border-slate-300 focus:bg-white rounded-2xl text-xs text-slate-800 placeholder-slate-400 font-medium transition-all outline-none"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword((prev) => !prev);
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 pr-3.5 pl-2 flex items-center text-slate-400 hover:text-slate-800 transition-colors z-10 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={2} className="text-slate-700 hover:scale-105 transition-transform" />
                ) : (
                  <Eye size={18} strokeWidth={2} className="hover:scale-105 transition-transform" />
                )}
              </button>
            </div>

            {/* Primary Submit Button: Log In (Dynamic Theme Primary Color + Looped Smooth Pulse Glow) */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ 
                backgroundColor: primaryColor,
                boxShadow: `0 8px 20px -4px ${primaryColor}4D`
              }}
              className="w-full py-3.5 px-4 hover:opacity-95 text-white font-bold text-sm rounded-2xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 relative overflow-hidden group"
            >
              {/* Subtle looped shimmering line */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span className="relative z-10">Log In</span>
              )}
            </button>

            {/* Secondary Action: Forgot Password Button */}
            <Link
              href="/auth/forgot-password"
              className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer group"
            >
              <Key size={14} className="text-slate-500 group-hover:rotate-12 transition-transform" />
              <span>Forgot Password?</span>
            </Link>
          </form>

          {/* Footer Security Note with subtle breathing icon */}
          <div className="text-center text-[11px] text-slate-400 font-medium pt-1 flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} style={{ color: primaryColor }} className="animate-pulse" />
            <span>Administrative Security Gateway</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Line Illustrations & Solid Ground Baseline */}
      <div className="relative w-full z-10 hidden md:flex items-end justify-between px-2 sm:px-6 pointer-events-none">
        {/* Left Girl with Laptop illustration with dynamic accent */}
        <div className="absolute left-0 bottom-0">
          <CharacterIllustration primaryColor={primaryColor} />
        </div>

        {/* Right Bar Charts illustration */}
        <div className="absolute right-0 bottom-0">
          <ChartIllustration />
        </div>
      </div>

      {/* Solid Ground Line spanning the bottom */}
      <div className="w-full border-b-[1.5px] border-[#1E1E24] absolute bottom-6 sm:bottom-10 left-0 right-0 z-0" />
    </div>
  );
}

export default function AdminLoginPage() {
  const { activeTheme } = useTheme();
  const primaryColor = activeTheme?.tokens?.primary || '#EC4899';

  return (
    <AdminGuestGuard>
      <div 
        className="min-h-screen bg-[#ECECF0] text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans"
      >
        <Suspense fallback={
          <div className="p-8 text-center text-xs text-slate-500 font-medium">
            Loading portal interface...
          </div>
        }>
          <AdminLoginForm />
        </Suspense>
      </div>
    </AdminGuestGuard>
  );
}
