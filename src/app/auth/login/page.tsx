'use client';

import React from 'react';
import ThemePageResolver from '@/lib/extensions/theme-page-resolver';

/**
 * Authentication Sign In Route
 * Dynamically resolves login page presentation from active theme,
 * falling back to the official built-in Default Theme.
 */
export default function Page() {
  return <ThemePageResolver pageName="LoginPage" />;
}
