import { UserRole } from '../supabase/store';

export type RouteAccess =
  | 'public'        // Accessible to guests and logged-in users alike
  | 'guest'         // Accessible ONLY to unauthenticated users (login, signup, landing)
  | 'authenticated' // Accessible to any logged-in user with active status
  | 'creator'       // Accessible to Creator, Admin, Super Admin
  | 'moderator'     // Accessible to Moderator, Admin, Super Admin
  | 'admin'         // Accessible to Admin, Super Admin
  | 'super_admin';  // Accessible ONLY to Super Admin

export interface RouteRule {
  pattern: string;
  access: RouteAccess;
  exact?: boolean;
}

/**
 * Single source of truth for all route protection rules.
 * Rules are evaluated top-to-bottom; the first matching rule determines access.
 */
export const ROUTE_RULES: RouteRule[] = [
  // 1. Guest-only routes (landing page, auth pages)
  { pattern: '/', access: 'guest', exact: true },
  { pattern: '/auth', access: 'guest' },
  { pattern: '/login', access: 'guest', exact: true },
  { pattern: '/signup', access: 'guest', exact: true },

  // 2. Explicit public routes (accessible without login)
  { pattern: '/admin/login', access: 'public', exact: true }, // Dedicated Admin Auth Gate
  { pattern: '/c', access: 'public' },             // Creator public profile (/c/[username])
  { pattern: '/p', access: 'public' },             // Dynamic CMS pages (/p/[slug])
  { pattern: '/explore', access: 'public' },       // Public discovery page
  { pattern: '/shorts', access: 'public' },        // Short-form public video feed
  { pattern: '/api', access: 'public' },           // API endpoints handle their own auth

  // 3. Role-restricted portal routes
  { pattern: '/admin/roles', access: 'super_admin' },
  { pattern: '/admin', access: 'admin' },
  { pattern: '/creator', access: 'creator' },
  { pattern: '/member', access: 'authenticated' },

  // 4. Authenticated app routes
  { pattern: '/onboarding', access: 'authenticated' },
  { pattern: '/feed', access: 'authenticated' },
  { pattern: '/messages', access: 'authenticated' },
  { pattern: '/notifications', access: 'authenticated' },
  { pattern: '/saved', access: 'authenticated' },
  { pattern: '/settings', access: 'authenticated' },
  { pattern: '/balance', access: 'authenticated' },
  { pattern: '/dashboard', access: 'authenticated' },
  { pattern: '/database', access: 'admin' },

  // Fallback default: Any unlisted route requires basic authentication
];

/**
 * Returns the access level for a given URL pathname.
 */
export function getRouteAccess(pathname: string): RouteAccess {
  // Normalize trailing slash (except root)
  const normalized = pathname.length > 1 && pathname.endsWith('/') 
    ? pathname.slice(0, -1) 
    : pathname;

  for (const rule of ROUTE_RULES) {
    if (rule.exact) {
      if (normalized === rule.pattern) {
        return rule.access;
      }
    } else {
      if (normalized === rule.pattern || normalized.startsWith(`${rule.pattern}/`)) {
        return rule.access;
      }
    }
  }

  // Default fallback for any route not explicitly mapped
  return 'authenticated';
}

/**
 * Hierarchy of roles and their allowed access levels.
 */
export function isRoleAllowed(access: RouteAccess, role: UserRole): boolean {
  if (access === 'public' || access === 'guest') {
    return true;
  }

  if (access === 'authenticated') {
    return role !== 'guest' && Boolean(role);
  }

  // Super admin can access everything
  if (role === 'super_admin') {
    return true;
  }

  if (access === 'admin') {
    return role === 'admin' || role === 'super_admin';
  }

  if (access === 'moderator') {
    return role === 'moderator' || role === 'admin' || role === 'super_admin';
  }

  if (access === 'creator') {
    return role === 'creator' || role === 'admin' || role === 'super_admin';
  }

  if (access === 'super_admin') {
    return role === 'super_admin';
  }

  return false;
}

/**
 * Resolve the role's default home dashboard after login or guest redirection.
 */
export function getRoleDefaultDestination(role: UserRole): string {
  switch (role) {
    case 'admin':
    case 'super_admin':
    case 'moderator':
      return '/admin/dashboard';
    case 'creator':
      return '/creator/dashboard';
    case 'member':
    default:
      return '/feed';
  }
}
