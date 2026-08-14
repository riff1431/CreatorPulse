'use client';

import React from 'react';
import { useTheme } from '@/lib/extensions/theme-engine';
import { ThemeComponentName } from './theme-types';
import { themeRegistry } from './theme-registry';
import { ThemeErrorBoundary } from './theme-error-boundary';

export interface ThemeComponentProps {
  name: ThemeComponentName;
  props?: Record<string, any>;
  fallback?: React.ReactNode;
  children?: React.ReactNode;
  [key: string]: any;
}

/**
 * Dynamic Theme Component Resolver
 * Dynamically resolves individual UI widgets (e.g. Navbar, StoryBar, PostCard, Button)
 * from the active theme, falling back safely to default-theme components.
 */
export function ThemeComponent({
  name,
  props = {},
  fallback,
  children,
  ...rest
}: ThemeComponentProps) {
  const { activeTheme } = useTheme();
  const themeKey = activeTheme?.slug || activeTheme?.id || 'default-theme';

  const { Component: ResolvedComponent, isOverridden, sourceTheme } = themeRegistry.resolveComponent(themeKey, name);
  const { Component: DefaultFallbackComponent } = themeRegistry.resolveComponent('default-theme', name);

  if (!ResolvedComponent) {
    return fallback ? <>{fallback}</> : null;
  }

  const mergedProps = { ...props, ...rest };

  const defaultElement = DefaultFallbackComponent ? (
    <DefaultFallbackComponent {...mergedProps} theme={activeTheme} isFallback={true}>
      {children}
    </DefaultFallbackComponent>
  ) : null;

  return (
    <ThemeErrorBoundary
      type="component"
      name={name}
      themeId={activeTheme?.id}
      fallbackComponent={defaultElement}
    >
      <ResolvedComponent
        {...mergedProps}
        theme={activeTheme}
        isOverridden={isOverridden}
        sourceTheme={sourceTheme}
      >
        {children}
      </ResolvedComponent>
    </ThemeErrorBoundary>
  );
}

/**
 * Hook to resolve a theme component constructor directly
 */
export function useThemeComponent(name: ThemeComponentName) {
  const { activeTheme } = useTheme();
  const themeKey = activeTheme?.slug || activeTheme?.id || 'default-theme';
  return themeRegistry.resolveComponent(themeKey, name);
}

export default ThemeComponent;
