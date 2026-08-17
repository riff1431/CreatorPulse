'use client';

import React from 'react';
import ThemePageResolver from '@/lib/extensions/theme-page-resolver';

/**
 * Top-level /signup Route Alias
 * Resolves standard customer/creator signup interface via theme system.
 */
export default function SignupPageAlias() {
  return <ThemePageResolver pageName="SignupPage" />;
}
