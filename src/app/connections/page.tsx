'use client';

import React, { Suspense } from 'react';
import ThemePageResolver from '@/lib/extensions/theme-page-resolver';

function ConnectionsContent() {
  return <ThemePageResolver pageName="ConnectionsPage" />;
}

export default function ConnectionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="w-8 h-8 border-4 border-[#EC4899] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ConnectionsContent />
    </Suspense>
  );
}
