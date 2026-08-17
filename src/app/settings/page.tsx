'use client';

import React from 'react';
import ThemePageResolver from '@/lib/extensions/theme-page-resolver';

/**
 * Account & Creator Settings Route
 * Dynamically resolves the settings page layout from the active theme,
 * adapting options for Fan / Member and Creator user roles.
 */
export default function Settings() {
  return <ThemePageResolver pageName="SettingsPage" />;
}
