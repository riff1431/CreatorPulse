'use client';

import React from 'react';
import { useTheme } from '@/lib/extensions/theme-engine';
import { ThemeLayoutName } from './theme-types';
import { themeRegistry } from './theme-registry';
import { ThemeErrorBoundary } from './theme-error-boundary';

export interface ThemeLayoutResolverProps {
  name: ThemeLayoutName;
  children: React.ReactNode;
  props?: Record<string, any>;
  [key: string]: any;
}

/**
 * Dynamic Theme Layout Resolver
 * Dynamically resolves layout structures from the active theme
 * and falls back safely to default-theme layouts.
 */
export function ThemeLayout({
  name,
  children,
  props = {},
  ...rest
}: ThemeLayoutResolverProps) {
  const { activeTheme } = useTheme();
  const themeKey = activeTheme?.slug || activeTheme?.id || 'default-theme';

  const { Component: ResolvedLayout, isOverridden, sourceTheme } = themeRegistry.resolveLayout(themeKey, name);
  const { Component: DefaultFallbackLayout } = themeRegistry.resolveLayout('default-theme', name);

  const mergedProps = { ...props, ...rest };

  const defaultElement = DefaultFallbackLayout ? (
    <DefaultFallbackLayout {...mergedProps} theme={activeTheme} isFallback={true}>
      {children}
    </DefaultFallbackLayout>
  ) : null;

  return (
    <ThemeErrorBoundary
      type="layout"
      name={name}
      themeId={activeTheme?.id}
      fallbackComponent={defaultElement}
    >
      <ResolvedLayout
        {...mergedProps}
        theme={activeTheme}
        isOverridden={isOverridden}
        sourceTheme={sourceTheme}
      >
        {children}
      </ResolvedLayout>
    </ThemeErrorBoundary>
  );
}

export default ThemeLayout;
