'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { GuestGuard } from '@/components/auth/RouteGuards';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Sparkles, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, 
  Eye, EyeOff, Shield, AlertCircle, CheckCircle2, User, Key, Crown, Ban
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Alert } from '../components/Alert';
import { Checkbox } from '../components/Checkbox';
import { useAuth } from '@/lib/auth/auth-context';
import { useSiteSettings } from '@/lib/settings/site-settings-context';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { settings } = useSiteSettings();

  const [email, setEmail] = useState('admin@creatorpulse.com');
  const [password, setPassword] = useState('AdminPass123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reason = searchParams?.get('reason');
  const redirectUrl = searchParams?.get('redirect');

  const handleQuickFill = (type: 'admin' | 'creator' | 'member' | 'moderator' | 'superadmin' | 'suspended') => {
    setErrorMessage('');
    if (type === 'admin') {
      setEmail('admin@creatorpulse.com');
      setPassword('AdminPass123!');
    } else if (type === 'superadmin') {
      setEmail('superadmin@creatorpulse.com');
      setPassword('SuperPass123!');
    } else if (type === 'creator') {
      setEmail('creator@creatorpulse.com');
      setPassword('CreatorPass123!');
    } else if (type === 'moderator') {
      setEmail('moderator@creatorpulse.com');
      setPassword('ModPass123!');
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
    setIsSubmitting(true);

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in all credentials.');
      setIsSubmitting(false);
      return;
    }

    const result = await login(email, password, rememberMe);

    if (!result.success) {
      setErrorMessage(result.error || 'Invalid credentials');
      setIsSubmitting(false);
      return;
    }

    const authedRole = result.user?.role || 'member';

    if (redirectUrl) {
      router.push(redirectUrl);
    } else if (authedRole === 'admin' || authedRole === 'super_admin') {
      router.push('/admin/dashboard');
    } else if (authedRole === 'creator') {
      router.push('/creator/dashboard');
    } else {
      router.push('/feed');
    }
  };

  let reasonAlert = null;
  if (reason === 'unauthorized') {
    reasonAlert = {
      title: "Authorization Required",
      message: "Your current account level does not have permissions to view that page. Sign in with administrative privileges."
    };
  } else if (reason === 'blocked') {
    reasonAlert = {
      title: "Account Suspended",
      message: "This account has been restricted or banned by the platform administrator due to policy violations."
    };
  } else if (reason) {
    reasonAlert = {
      title: "Security Clearance Required",
      message: "Please authenticate with your credentials to access the requested view."
    };
  }

  return (
    <div className="max-w-md w-full space-y-6 relative z-10">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 group">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt={settings.site_name || 'Logo'} className="h-12 w-auto max-w-[180px] object-contain rounded-2xl shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F472B6] flex items-center justify-center shadow-lg shadow-[#EC4899]/25 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="text-white" size={24} />
            </div>
          )}
        </Link>
        <h1 className="text-2xl font-black text-[#18181B]">Welcome Back</h1>
        <p className="text-xs text-[#71717A] font-medium">Sign in to your {settings.site_name || 'CreatorPulse'} community account</p>
      </div>

      {reasonAlert && (
        <div className="p-3.5 bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl text-xs text-[#BE123C] flex items-start gap-2.5">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{reasonAlert.title}</p>
            <p className="text-[11px] mt-0.5">{reasonAlert.message}</p>
          </div>
        </div>
      )}

      <Card className="p-6 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-[#18181B]">Quick Test Credentials:</label>
            <span className="text-[10px] text-[#EC4899] font-bold uppercase tracking-wider">Click to autofill</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 bg-[#FFF9FC] p-1.5 rounded-2xl border border-[#F3DCE8]">
            <button
              type="button"
              onClick={() => handleQuickFill('superadmin')}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                email.includes('superadmin')
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
              }`}
            >
              <Crown size={12} />
              <span>👑 Super</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                email.includes('admin@')
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
              }`}
            >
              <Shield size={12} />
              <span>🛡️ Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('creator')}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                email.includes('creator')
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
              }`}
            >
              <Eye size={12} />
              <span>🎨 Creator</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('moderator')}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                email.includes('moderator')
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
              }`}
            >
              <Key size={12} />
              <span>⚖️ Moderator</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('member')}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                email.includes('fan') || email.includes('alex')
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
              }`}
            >
              <UserCheck size={12} />
              <span>👋 Member</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('suspended')}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                email.includes('suspended')
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
                  : 'text-[#71717A] hover:text-rose-600 hover:bg-rose-50/50'
              }`}
            >
              <Ban size={12} />
              <span>🚫 Blocked</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <Alert variant="error" onDismiss={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={16} />}
            placeholder="name@creatorpulse.com"
            required
          />

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">Password</label>
              <Link href="/auth/forgot-password" className="text-[#BE185D] dark:text-[#F472B6] text-[11px] font-bold hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              isPassword={true}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <Checkbox
              checked={rememberMe}
              onChange={setRememberMe}
              label="Remember my session"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight size={14} />}
          >
            Sign In to Account
          </Button>
        </form>

        <div className="text-center text-xs text-[#71717A] border-t border-[#F3DCE8] pt-4 font-medium">
          Don&apos;t have an account yet?{' '}
          <Link href="/auth/signup" className="text-[#BE185D] font-extrabold hover:underline">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
}

export function LoginPage() {
  return (
    <GuestGuard>
      <div className="min-h-screen bg-[#FFF9FC] dark:bg-[#0F0A14] text-[#18181B] dark:text-[#FDF2F8] flex flex-col items-center justify-center p-4 selection:bg-[#FCE7F3] selection:text-[#DB2777] relative transition-colors duration-200">
        <div className="absolute w-96 h-96 bg-[#FCE7F3]/60 dark:bg-pink-900/15 rounded-full blur-[140px] pointer-events-none" />
        <Suspense fallback={
          <div className="p-8 text-center text-xs text-[#71717A] dark:text-[#D4B8D0] font-bold">
            Loading login portal...
          </div>
        }>
          <LoginFormContent />
        </Suspense>
      </div>
    </GuestGuard>
  );
}

export default LoginPage;
