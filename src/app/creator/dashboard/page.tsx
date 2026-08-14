'use client';

import React from 'react';
import ThemePageResolver from '@/lib/extensions/theme-page-resolver';

/**
 * Creator Dashboard Route
 * Dynamically resolves the Creator Studio dashboard from the active theme,
 * falling back safely to the official built-in Default Theme.
 */
export default function Page() {
  return <ThemePageResolver pageName="CreatorDashboardPage" />;
}
