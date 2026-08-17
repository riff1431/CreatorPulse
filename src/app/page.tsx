'use client';

import React from 'react';
import ThemePageResolver from '@/lib/extensions/theme-page-resolver';
import { GuestGuard } from '@/components/auth/RouteGuards';

/**
 * Root Landing Page Route
 * 
 * Guest-only: Authenticated users are redirected to /feed (or their role-specific
 * dashboard) at the server proxy level. GuestGuard provides client-side defense-in-depth
 * for SPA navigation (e.g. browser back button from /feed to /).
 * 
 * Dynamically resolves the landing page presentation from the active theme,
 * safely falling back to the official built-in Default Theme.
 */
export default function Page() {
  return (
    <GuestGuard>
      <ThemePageResolver pageName="LandingPage" />
    </GuestGuard>
  );
}
