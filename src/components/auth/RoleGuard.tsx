'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Sparkles, UserCheck, Eye, Shield, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { UserRole } from '@/lib/supabase/store';
import { getRoles } from '@/lib/auth/role-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: string;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  fallbackTitle,
  fallbackMessage
}) => {
  const router = useRouter();
  const { role, user, switchRole, hasPermission, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-10 h-10 rounded-full border-3 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] animate-spin"></div>
        <p className="text-xs text-[var(--color-text-secondary)] font-bold">Verifying security credentials & access rights...</p>
      </div>
    );
  }

  let isAuthorized = false;
  if (requiredPermission) {
    isAuthorized = hasPermission(requiredPermission);
  } else if (allowedRoles) {
    isAuthorized = allowedRoles.includes(role);
  } else {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    const rolesList = getRoles();
    const authorizedRoles = requiredPermission
      ? rolesList.filter(r => r.status === 'active' && r.permissions[requiredPermission as keyof typeof r.permissions]).map(r => r.id)
      : allowedRoles || [];

    const label = requiredPermission
      ? `Permission: ${requiredPermission.replace(/_/g, ' ')}`
      : allowedRoles?.includes('admin')
      ? 'Administrator'
      : allowedRoles?.includes('creator')
      ? 'Creator'
      : 'Member';

    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <Card className="p-8 text-center space-y-6 border border-[var(--color-border)] shadow-lg">
          <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mx-auto shadow-sm">
            <ShieldAlert size={32} />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
              Access Restricted
            </span>
            <h2 className="text-2xl font-black text-[var(--color-text-primary)] mt-2">
              {fallbackTitle || 'Security Clearance Required'}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-md mx-auto font-medium">
              {fallbackMessage ||
                `You are currently logged in as ${user?.fullName || 'Guest'} with the "${role.toUpperCase()}" role. This operation requires the privilege "${label}".`}
            </p>
          </div>

          {authorizedRoles.length > 0 && (
            <div className="bg-[var(--color-surface-secondary)] p-4 rounded-2xl border border-[var(--color-border)] space-y-3 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
                <Sparkles size={14} className="text-[var(--color-primary)]" />
                <span>Sandbox Instant Demo Bypass:</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                Switch your active role instantly to test this protected view:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {authorizedRoles.map((r) => {
                  const roleName = rolesList.find(roleItem => roleItem.id === r)?.name || r;
                  return (
                    <Button
                      key={r}
                      variant="primary"
                      size="sm"
                      onClick={() => switchRole(r)}
                      className="w-full text-xs"
                      leftIcon={r === 'admin' ? <Shield size={14} /> : <Eye size={14} />}
                    >
                      Switch to {roleName}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 border-t border-[var(--color-border)]">
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
