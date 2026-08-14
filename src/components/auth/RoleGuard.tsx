'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, ArrowRight, Sparkles, UserCheck, Eye, Shield, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { UserRole } from '@/lib/supabase/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackTitle?: string;
  fallbackMessage?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallbackTitle,
  fallbackMessage
}) => {
  const router = useRouter();
  const { role, user, isAuthenticated, isLoading, switchRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-10 h-10 rounded-full border-3 border-[#EC4899]/30 border-t-[#EC4899] animate-spin"></div>
        <p className="text-xs text-[#71717A] font-bold">Verifying security credentials & access rights...</p>
      </div>
    );
  }

  const isAuthorized = allowedRoles.includes(role);

  if (!isAuthorized) {
    const requiredRoleLabel = allowedRoles.includes('admin')
      ? 'Administrator'
      : allowedRoles.includes('creator')
      ? 'Creator'
      : 'Member';

    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <Card className="p-8 text-center space-y-6 border border-[#F3DCE8] shadow-lg shadow-[#EC4899]/5">
          <div className="w-16 h-16 rounded-3xl bg-[#FFE4E6] border border-[#FECDD3] flex items-center justify-center text-[#F43F5E] mx-auto shadow-sm">
            <ShieldAlert size={32} />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#F43F5E] bg-[#FFE4E6] px-3 py-1 rounded-full border border-[#FECDD3]">
              Role Access Restricted
            </span>
            <h2 className="text-2xl font-black text-[#18181B] mt-2">
              {fallbackTitle || `${requiredRoleLabel} Privileges Required`}
            </h2>
            <p className="text-xs text-[#71717A] leading-relaxed max-w-md mx-auto font-medium">
              {fallbackMessage ||
                `You are currently logged in as ${user?.fullName || 'Guest'} with the "${role.toUpperCase()}" role. This area is strictly protected and requires ${requiredRoleLabel.toLowerCase()} access.`}
            </p>
          </div>

          {/* Quick Demo Bypass Actions */}
          <div className="bg-[#FFF9FC] p-4 rounded-2xl border border-[#F3DCE8] space-y-3 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
              <Sparkles size={14} className="text-[#EC4899]" />
              <span>Sandbox Instant Demo Bypass:</span>
            </div>
            <p className="text-[11px] text-[#71717A]">
              Switch your active role instantly to test this protected view:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {allowedRoles.map((r) => (
                <Button
                  key={r}
                  variant="primary"
                  size="sm"
                  onClick={() => switchRole(r)}
                  className="w-full text-xs"
                  leftIcon={r === 'admin' ? <Shield size={14} /> : <Eye size={14} />}
                >
                  Switch to {r.toUpperCase()} Role
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 border-t border-[#F3DCE8]">
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full" leftIcon={<LogIn size={14} />}>
                Sign In with Different Account
              </Button>
            </Link>
            <Link href="/feed" className="w-full sm:w-auto">
              <Button variant="ghost" size="sm" className="w-full">
                Back to Feed
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
