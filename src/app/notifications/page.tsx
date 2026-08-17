'use client';

import React from 'react';
import ThemePageResolver from '@/lib/extensions/theme-page-resolver';

/**
 * Fan / Member Notifications Route
 * Dynamically resolves the Notifications and Activity Center page from the active theme,
 * falling back to the official built-in Default Theme.
 */
export default function NotificationsRoute() {
  return <ThemePageResolver pageName="NotificationsPage" />;
}
