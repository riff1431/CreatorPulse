'use client';

import React from 'react';
import ThemePageResolver from '@/lib/extensions/theme-page-resolver';

/**
 * Public Creator Profile Route
 * Dynamically resolves creator profile page presentation from active theme,
 * falling back to the official built-in Default Theme.
 */
export default function Page() {
  return <ThemePageResolver pageName="CreatorProfilePage" />;
}
