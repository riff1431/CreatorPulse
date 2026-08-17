'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldAlert, Sparkles, ArrowLeft, LogIn, Shield, Eye, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { UserRole } from '@/lib/supabase/store';

function ForbiddenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { role, user, switchRole } = useAuth();
  const isLive = isSupabaseConfigured();

  const requiredAccess = searchParams.get('required') || 'restricted';
  const attemptedPath = searchParams.get('from') || 'requested resource';

  const roleLabel = (role || 'guest').toUpperCase();

  const requiredRoleLabel = 
    requiredAccess === 'admin' ? 'Administrator' :
    requiredAccess === 'creator' ? 'Creator' :
    requiredAccess === 'super_admin' ? 'Super Administrator' :
    requiredAccess === 'moderator' ? 'Moderator' :
    'Authorized Member';

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    if (attemptedPath && attemptedPath !== 'requested resource') {
      router.push(attemptedPath);
    } else {
      router.push('/feed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <Card className="p-8 md:p-12 text-center space-y-8 border border-[var(--color-border)] shadow-2xl bg-[var(--color-surface)] rounded-3xl">
        
        {/* Shield Icon Badge */}
        <div className="relative w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto shadow-inner">
          <ShieldAlert size={42} />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow">
            <Lock size={14} />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-500 bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100">
            HTTP 403 — Access Forbidden
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
            Security Clearance Required
          </h1>
          <p className="text-xs md:text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-md mx-auto font-medium">
            You are logged in as <span className="font-bold text-[var(--color-text-primary)]">{user?.fullName || 'User'}</span> with the <span className="font-bold text-rose-500">{roleLabel}</span> role. Accessing <code className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px]">{attemptedPath}</code> requires <span className="font-bold text-[var(--color-text-primary)]">{requiredRoleLabel}</span> privileges.
          </p>
        </div>

        {/* Sandbox Demo Instant Role Switcher (Offline/Mock Mode) */}
        {!isLive && (
          <div className="bg-[var(--color-surface-secondary)] p-6 rounded-2xl border border-[var(--color-border)] space-y-4 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
              <Sparkles size={16} className="text-pink-500" />
              <span>Sandbox Instant Demo Bypass</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Since CreatorPulse is running in sandbox mode, you can switch your active role instantly to test this page:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {(requiredAccess === 'admin' || requiredAccess === 'super_admin') && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleRoleSwitch('admin')}
                  className="w-full text-xs"
                  leftIcon={<Shield size={14} />}
                >
                  Switch to Admin Role
                </Button>
              )}

              {requiredAccess === 'creator' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleRoleSwitch('creator')}
                  className="w-full text-xs"
                  leftIcon={<Eye size={14} />}
                >
                  Switch to Creator Role
                </Button>
              )}

              {requiredAccess === 'super_admin' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleRoleSwitch('super_admin')}
                  className="w-full text-xs"
                  leftIcon={<Shield size={14} />}
                >
                  Switch to Super Admin
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRoleSwitch('member')}
                className="w-full text-xs"
              >
                Switch to Fan / Member
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-[var(--color-border)]">
          <Link href="/feed" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full text-xs" leftIcon={<ArrowLeft size={16} />}>
              Return to Community Feed
            </Button>
          </Link>
          <Link href="/auth/login" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full text-xs" leftIcon={<LogIn size={16} />}>
              Sign In with Different Account
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9FC] text-slate-900">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={
          <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
            <div className="w-10 h-10 rounded-full border-3 border-pink-500/30 border-t-pink-500 animate-spin"></div>
            <p className="text-xs text-slate-500 font-bold">Verifying security parameters...</p>
          </div>
        }>
          <ForbiddenContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
