'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

// Premium spinner layout to prevent redirect flicker during hydration
const FullPageLoading = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF9FC] p-8 space-y-3">
    <div className="w-12 h-12 rounded-full border-4 border-[#EC4899]/30 border-t-[#EC4899] animate-spin"></div>
    <p className="text-xs text-[#71717A] font-extrabold tracking-wider uppercase">Loading security context...</p>
  </div>
);

/**
 * GuestGuard: Restricts access to guest users (e.g. login, signup pages).
 * Redirects logged-in users to /feed or their respective portals.
 */
export const GuestGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      let dest = '/feed';
      if (role === 'admin' || role === 'super_admin') {
        dest = '/admin/dashboard';
      } else if (role === 'creator') {
        dest = '/creator/dashboard';
      }
      router.replace(dest);
    }
  }, [isLoading, isAuthenticated, role, router]);

  if (isLoading || isAuthenticated) {
    return <FullPageLoading />;
  }

  return <>{children}</>;
};

/**
 * MemberGuard: Restricts access to authenticated users.
 * Redirects guests to login page and preserves redirect path.
 */
export const MemberGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
      } else if (user && (user.status === 'suspended' || user.status === 'banned')) {
        router.replace('/auth/login?reason=blocked');
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading || !isAuthenticated || (user && (user.status === 'suspended' || user.status === 'banned'))) {
    return <FullPageLoading />;
  }

  return <>{children}</>;
};

/**
 * CreatorGuard: Restricts access to Creators, Admins, and Super Admins.
 */
export const CreatorGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, role, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
      } else if (user && (user.status === 'suspended' || user.status === 'banned')) {
        router.replace('/auth/login?reason=blocked');
      } else if (role !== 'creator' && role !== 'admin' && role !== 'super_admin') {
        router.replace('/feed?reason=unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, role, user, pathname, router]);

  if (
    isLoading ||
    !isAuthenticated ||
    (user && (user.status === 'suspended' || user.status === 'banned')) ||
    (role !== 'creator' && role !== 'admin' && role !== 'super_admin')
  ) {
    return <FullPageLoading />;
  }

  return <>{children}</>;
};

/**
 * ModeratorGuard: Restricts access to Moderators, Admins, and Super Admins.
 */
export const ModeratorGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, role, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
      } else if (user && (user.status === 'suspended' || user.status === 'banned')) {
        router.replace('/auth/login?reason=blocked');
      } else if (role !== 'moderator' && role !== 'admin' && role !== 'super_admin') {
        router.replace('/feed?reason=unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, role, user, pathname, router]);

  if (
    isLoading ||
    !isAuthenticated ||
    (user && (user.status === 'suspended' || user.status === 'banned')) ||
    (role !== 'moderator' && role !== 'admin' && role !== 'super_admin')
  ) {
    return <FullPageLoading />;
  }

  return <>{children}</>;
};

/**
 * AdminGuard: Restricts access to Admins and Super Admins.
 */
export const AdminGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, role, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
      } else if (user && (user.status === 'suspended' || user.status === 'banned')) {
        router.replace('/auth/login?reason=blocked');
      } else if (role !== 'admin' && role !== 'super_admin') {
        router.replace('/feed?reason=unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, role, user, pathname, router]);

  if (
    isLoading ||
    !isAuthenticated ||
    (user && (user.status === 'suspended' || user.status === 'banned')) ||
    (role !== 'admin' && role !== 'super_admin')
  ) {
    return <FullPageLoading />;
  }

  return <>{children}</>;
};

/**
 * SuperAdminGuard: Restricts access exclusively to Super Admins.
 */
export const SuperAdminGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, role, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
      } else if (user && (user.status === 'suspended' || user.status === 'banned')) {
        router.replace('/auth/login?reason=blocked');
      } else if (role !== 'super_admin') {
        router.replace('/feed?reason=unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, role, user, pathname, router]);

  if (
    isLoading ||
    !isAuthenticated ||
    (user && (user.status === 'suspended' || user.status === 'banned')) ||
    role !== 'super_admin'
  ) {
    return <FullPageLoading />;
  }

  return <>{children}</>;
};
