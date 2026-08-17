'use client';

import React from 'react';
import ThemePageResolver from '@/lib/extensions/theme-page-resolver';

/**
 * Fan / Member Messages Route
 * Dynamically resolves the Messages / 1-on-1 Direct Messaging page from the active theme,
 * falling back to the official built-in Default Theme.
 */
export default function MessagesRoute() {
  return <ThemePageResolver pageName="MessagesPage" />;
}
