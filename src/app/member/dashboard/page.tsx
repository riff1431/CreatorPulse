'use client';

import React from 'react';
import ThemePageResolver from '@/lib/extensions/theme-page-resolver';
import { MemberGuard } from '@/components/auth/RouteGuards';

/**
 * Fan / Member Dashboard Route
 * Dynamically resolves the Member Dashboard layout and active subscriptions
 * from the active theme package.
 */
export default function FanDashboard() {
  return (
    <MemberGuard>
      <ThemePageResolver pageName="MemberDashboardPage" />
    </MemberGuard>
  );
}

