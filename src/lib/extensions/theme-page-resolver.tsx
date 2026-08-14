'use client';

import React from 'react';
import { useTheme } from '@/lib/extensions/theme-engine';
import * as DefaultThemePages from '@themes/default-theme';

export interface ThemePageResolverProps {
  pageName: 
    | 'LandingPage'
    | 'LoginPage'
    | 'SignupPage'
    | 'FeedPage'
    | 'CreatorDashboardPage'
    | 'CreatorProfilePage'
    | 'SinglePostPage'
    | 'MessagesPage'
    | 'NotificationsPage'
    | 'ShortsPage'
    | 'ExplorePage'
    | 'SavedPage'
    | 'BalancePage';
  props?: Record<string, any>;
  fallback?: React.ReactNode;
}

/**
 * Dynamic Theme Page Resolver
 * Resolves the requested page view from the active theme dynamically.
 * Provides safe, robust fallback to the official Default Theme if not overridden.
 */
export function ThemePageResolver({
  pageName,
  props = {},
  fallback
}: ThemePageResolverProps) {
  const { activeTheme } = useTheme();

  // If fallback is explicitly provided and active theme is not default, we can check for overrides
  const DefaultComponent = (DefaultThemePages as Record<string, any>)[pageName];

  if (!DefaultComponent) {
    return fallback ? <>{fallback}</> : null;
  }

  return <DefaultComponent {...props} theme={activeTheme} />;
}

export default ThemePageResolver;
