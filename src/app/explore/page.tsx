'use client';

import React from 'react';
import ThemePageResolver from '@/lib/extensions/theme-page-resolver';

/**
 * Explore Creators & Communities Route
 * Dynamically resolves presentation from active theme, falling back to Default Theme.
 */
export default function Page() {
  return <ThemePageResolver pageName="ExplorePage" />;
}
