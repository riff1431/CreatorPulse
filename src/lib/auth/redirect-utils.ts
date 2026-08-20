import { APP_CONFIG } from '@/config/app.config';

/**
 * Checks if a given pathname is a guest-only route (landing page or auth portal).
 */
export function isGuestOnlyRoute(pathname: string): boolean {
  if (!pathname) return false;
  return (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/auth')
  );
}

/**
 * Validates a redirect URL to prevent open redirects, redirect loops, and invalid target endpoints.
 */
export function isSafeRedirect(url?: string | null): boolean {
  if (!url) return false;
  
  // Must be an absolute path starting with / but not protocol-relative //
  if (!url.startsWith('/') || url.startsWith('//')) {
    return false;
  }

  // Must not target API endpoints
  if (url.startsWith('/api')) {
    return false;
  }

  // Must not target guest-only routes to prevent post-login loops
  // Normalize path by stripping query params/hash for route check
  const pathWithoutQuery = url.split('?')[0].split('#')[0];
  if (isGuestOnlyRoute(pathWithoutQuery)) {
    return false;
  }

  return true;
}

/**
 * Gets the default post-login destination route for a given user role.
 * - Admin / Super Admin / Moderator -> /admin/dashboard
 * - Creator -> /feed (with creator tools enabled)
 * - Fan / Member -> /feed
 */
export function getDefaultDestination(role?: string | null): string {
  if (!role) return APP_CONFIG.auth.defaultRedirectRoute || '/feed';

  if (role === 'admin' || role === 'super_admin' || role === 'moderator') {
    return APP_CONFIG.auth.adminRedirectRoute || '/admin/dashboard';
  }

  if (role === 'creator') {
    return APP_CONFIG.auth.creatorRedirectRoute || '/feed';
  }

  return APP_CONFIG.auth.defaultRedirectRoute || '/feed';
}

/**
 * Computes the final post-login destination URL.
 * Prefers valid requested redirect URLs, falling back to role-based default routes.
 */
export function getPostLoginDestination(role?: string | null, redirectUrl?: string | null): string {
  if (redirectUrl && isSafeRedirect(redirectUrl)) {
    return redirectUrl;
  }
  return getDefaultDestination(role);
}
