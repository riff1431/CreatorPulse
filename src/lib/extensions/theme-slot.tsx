'use client';

import React from 'react';
import { useTheme } from './theme-engine';

export interface ThemeSlotProps {
  name: 'LandingHero' | 'MainLayout' | 'Header' | 'Footer' | 'PostCard' | 'Button' | 'CreatorBadge' | string;
  fallback?: React.ReactNode;
  children?: React.ReactNode;
  [key: string]: any;
}

/**
 * ThemeSlot dynamically renders theme-specific overrides from the active theme
 * or falls back gracefully to core application UI components.
 */
export const ThemeSlot: React.FC<ThemeSlotProps> = ({
  name,
  fallback = null,
  children = null,
  ...props
}) => {
  const { activeTheme } = useTheme();

  // If theme has slot customization or active overrides
  const hasCustomOverride = Boolean(activeTheme?.isCustom || (activeTheme?.id !== 'theme-default-theme' && !activeTheme?.isDefault));

  if (children) {
    return (
      <div data-theme-slot={name} data-theme-id={activeTheme.id} className="theme-slot-wrapper">
        {children}
      </div>
    );
  }

  return (
    <div data-theme-slot={name} data-theme-id={activeTheme.id} className="theme-slot-wrapper">
      {fallback}
    </div>
  );
};

export default ThemeSlot;
