'use client';

import React from 'react';
import { useTheme } from '@/lib/extensions/theme-engine';
import { ThemePageName } from './theme-types';
import { themeRegistry } from './theme-registry';
import { ThemeErrorBoundary } from './theme-error-boundary';

export interface ThemePageResolverProps {
  pageName: ThemePageName;
  props?: Record<string, any>;
  fallback?: React.ReactNode;
}

/**
 * Dynamic Theme Page Resolver
 * Dynamically resolves the active theme's page template.
 * If the active theme does not override the page, it automatically falls back
 * to the official Default Theme counterpart with full business logic preservation.
 * Wraps execution inside a ThemeErrorBoundary to prevent any crashes.
 */
export function ThemePageResolver({
  pageName,
  props = {},
  fallback
}: ThemePageResolverProps) {
  const { activeTheme } = useTheme();
  const themeKey = activeTheme?.slug || activeTheme?.id || 'default-theme';

  const { Component: ResolvedComponent, isOverridden, sourceTheme } = themeRegistry.resolvePage(themeKey, pageName);
  const { Component: DefaultFallbackComponent } = themeRegistry.resolvePage('default-theme', pageName);

  if (!ResolvedComponent) {
    return fallback ? <>{fallback}</> : null;
  }

  const defaultElement = DefaultFallbackComponent ? (
    <DefaultFallbackComponent {...props} theme={activeTheme} isFallback={true} />
  ) : null;

  return (
    <ThemeErrorBoundary
      type="page"
      name={pageName}
      themeId={activeTheme?.id}
      fallbackComponent={defaultElement}
    >
      <ResolvedComponent
        {...props}
        theme={activeTheme}
        isOverridden={isOverridden}
        sourceTheme={sourceTheme}
      />
    </ThemeErrorBoundary>
  );
}

export default ThemePageResolver;
