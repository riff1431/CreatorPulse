'use client';

import React from 'react';
import ThemePageResolver from '@/lib/extensions/theme-page-resolver';

/**
 * Root Landing Page Route
 * Dynamically resolves the landing page presentation from the active theme,
 * safely falling back to the official built-in Default Theme.
 */
export default function Page() {
  return <ThemePageResolver pageName="LandingPage" />;
}
