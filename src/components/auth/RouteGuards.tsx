'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { RouteAccess, getRouteAccess, isRoleAllowed, getRoleDefaultDestination, sanitizeRedirectUrl } from '@/lib/auth/route-config';

// Premium spinner layout to prevent redirect flicker during hydration
export const FullPageLoading = ({ delayMs = 250 }: { delayMs?: number }) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!show) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF9FC] dark:bg-[#0B0612] p-8 space-y-3 transition-colors">
      <div className="w-12 h-12 rounded-full border-4 border-[#EC4899]/30 border-t-[#EC4899] animate-spin"></div>
      <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] font-extrabold tracking-wider uppercase">Loading security context...</p>
    </div>
  );
};

interface RouteGuardProps {
  access: RouteAccess;
  children: ReactNode;
}

/**
 * Generic RouteGuard engine. Verifies access requirements and handles redirects cleanly.
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({ access, children }) => {
  const { isAuthenticated, role, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // 1. Account blockage check
    if (isAuthenticated && user && (user.status === 'suspended' || user.status === 'banned')) {
      const isTargetingAdmin = pathname.startsWith('/admin');
      const blockUrl = isTargetingAdmin ? '/admin/login?reason=blocked' : '/auth/login?reason=blocked';
      if (pathname !== '/auth/login' && pathname !== '/admin/login') {
        router.replace(blockUrl);
      }
      return;
    }

    // 2. Incomplete Onboarding Check for Fans and Creators
    if (
      isAuthenticated &&
      user &&
      user.isOnboarded === false &&
      (role === 'member' || role === 'creator') &&
      pathname !== '/onboarding' &&
      access !== 'public' &&
      access !== 'guest'
    ) {
      if (pathname !== '/onboarding') {
        router.replace('/onboarding');
      }
      return;
    }

    // If user is already onboarded and visits /onboarding, redirect to home
    if (isAuthenticated && user && user.isOnboarded === true && pathname === '/onboarding') {
      const destination = getRoleDefaultDestination(role);
      if (pathname !== destination) {
        router.replace(destination);
      }
      return;
    }

    // 3. Guest-only route protection (redirect logged-in users to home dashboard)
    if (access === 'guest') {
      if (isAuthenticated) {
        if (user && user.isOnboarded === false && (role === 'member' || role === 'creator')) {
          if (pathname !== '/onboarding') {
            router.replace('/onboarding');
          }
        } else {
          const destination = getRoleDefaultDestination(role);
          if (pathname !== destination) {
            router.replace(destination);
          }
        }
      }
      return;
    }

    // 4. Public routes require no redirection
    if (access === 'public') {
      return;
    }

    // 5. Protected route checks (authenticated, creator, moderator, admin, super_admin)
    if (!isAuthenticated) {
      const isTargetingAdmin = pathname.startsWith('/admin');
      const safeRedirect = sanitizeRedirectUrl(pathname);
      const loginUrl = isTargetingAdmin 
        ? `/admin/login?redirect=${encodeURIComponent(safeRedirect)}`
        : `/auth/login?redirect=${encodeURIComponent(safeRedirect)}`;
      if (pathname !== '/auth/login' && pathname !== '/admin/login') {
        router.replace(loginUrl);
      }
      return;
    }

    if (!isRoleAllowed(access, role)) {
      const forbiddenUrl = `/403?required=${access}&from=${encodeURIComponent(pathname)}`;
      if (pathname !== '/403') {
        router.replace(forbiddenUrl);
      }
    }
  }, [isLoading, isAuthenticated, role, user, access, pathname, router]);

  // Render spinner while resolving security context or redirecting
  if (isLoading) {
    return <FullPageLoading />;
  }

  // Guard checks for rendering content
  if (access === 'guest' && isAuthenticated) {
    return <FullPageLoading />;
  }

  if (access !== 'public' && access !== 'guest') {
    if (!isAuthenticated || (user && (user.status === 'suspended' || user.status === 'banned')) || !isRoleAllowed(access, role)) {
      return <FullPageLoading />;
    }
  }

  return <>{children}</>;
};

/**
 * AdminGuestGuard: For /admin/login.
 * If user is already logged in as Admin/Moderator/Super Admin, redirect to /admin/dashboard.
 */
export const AdminGuestGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && (role === 'admin' || role === 'super_admin' || role === 'moderator')) {
      router.replace('/admin/dashboard');
    }
  }, [isLoading, isAuthenticated, role, router]);

  if (isLoading) {
    return <FullPageLoading />;
  }

  if (isAuthenticated && (role === 'admin' || role === 'super_admin' || role === 'moderator')) {
    return <FullPageLoading />;
  }

  return <>{children}</>;
};

/**
 * AutoRouteGuard: Automatically reads the current pathname and applies
 * client-side route protection based on the centralized route config.
 */
export const AutoRouteGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const access = getRouteAccess(pathname);

  if (access === 'public') {
    return <>{children}</>;
  }

  return <RouteGuard access={access}>{children}</RouteGuard>;
};

/**
 * Backward-compatible named re-exports for component/layout wrappers.
 */
export const GuestGuard: React.FC<{ children: ReactNode }> = ({ children }) => (
  <RouteGuard access="guest">{children}</RouteGuard>
);

export const MemberGuard: React.FC<{ children: ReactNode }> = ({ children }) => (
  <RouteGuard access="authenticated">{children}</RouteGuard>
);

export const CreatorGuard: React.FC<{ children: ReactNode }> = ({ children }) => (
  <RouteGuard access="creator">{children}</RouteGuard>
);

export const ModeratorGuard: React.FC<{ children: ReactNode }> = ({ children }) => (
  <RouteGuard access="moderator">{children}</RouteGuard>
);

export const AdminGuard: React.FC<{ children: ReactNode }> = ({ children }) => (
  <RouteGuard access="admin">{children}</RouteGuard>
);

export const SuperAdminGuard: React.FC<{ children: ReactNode }> = ({ children }) => (
  <RouteGuard access="super_admin">{children}</RouteGuard>
);
