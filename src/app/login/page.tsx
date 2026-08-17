'use client';

import React from 'react';
import ThemePageResolver from '@/lib/extensions/theme-page-resolver';

/**
 * Top-level /login Route Alias
 * Resolves standard customer/fan login interface via theme system.
 */
export default function LoginPageAlias() {
  return <ThemePageResolver pageName="LoginPage" />;
}
