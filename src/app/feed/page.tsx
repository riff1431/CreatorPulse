'use client';

import React from 'react';
import ThemePageResolver from '@/lib/extensions/theme-page-resolver';

/**
 * Community Feed Route
 * Dynamically resolves the feed layout and widgets from the active theme,
 * falling back to the official built-in Default Theme.
 */
export default function Page() {
  return <ThemePageResolver pageName="FeedPage" />;
}
