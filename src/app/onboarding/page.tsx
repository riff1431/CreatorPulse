'use client';

import React from 'react';
import ThemePageResolver from '@/lib/extensions/theme-page-resolver';

/**
 * Onboarding Flow Route
 * Dynamically resolves onboarding wizard from active theme,
 * falling back to the official built-in Default Theme.
 */
export default function OnboardingRoute() {
  return <ThemePageResolver pageName="OnboardingPage" />;
}
