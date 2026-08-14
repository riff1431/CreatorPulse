'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeManifest, ThemeTokens } from './theme-types';
import { DEFAULT_THEMES } from './default-extensions';
import { logAuditEvent } from './package-installer';

interface ThemeContextType {
  themes: ThemeManifest[];
  activeTheme: ThemeManifest;
  activateTheme: (themeId: string) => void;
  installTheme: (manifest: ThemeManifest) => boolean;
  deleteTheme: (themeId: string) => boolean;
  customizeTheme: (themeId: string, updatedTokens: Partial<ThemeTokens>) => void;
  rollbackTheme: (themeId: string) => void;
  exportTheme: (themeId: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_THEMES_KEY = 'creatorpulse_themes';
const STORAGE_ACTIVE_THEME_ID = 'creatorpulse_active_theme_id';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themes, setThemes] = useState<ThemeManifest[]>(DEFAULT_THEMES);
  const [activeThemeId, setActiveThemeId] = useState<string>('theme-rose-blush');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedThemesRaw = localStorage.getItem(STORAGE_THEMES_KEY);
      const storedActiveId = localStorage.getItem(STORAGE_ACTIVE_THEME_ID);

      let currentThemes = DEFAULT_THEMES;
      if (storedThemesRaw) {
        currentThemes = JSON.parse(storedThemesRaw);
        setThemes(currentThemes);
      }

      if (storedActiveId && currentThemes.some(t => t.id === storedActiveId)) {
        setActiveThemeId(storedActiveId);
      } else {
        setActiveThemeId('theme-rose-blush');
      }
    } catch (e) {
      console.error('Failed to load themes from storage', e);
    }
  }, []);

  const activeTheme = themes.find((t) => t.id === activeThemeId) || themes[0] || DEFAULT_THEMES[0];

  // Apply CSS custom properties dynamically to document.documentElement
  useEffect(() => {
    if (typeof document === 'undefined' || !activeTheme) return;

    const root = document.documentElement;
    const tokens = activeTheme.tokens;

    root.style.setProperty('--color-primary', tokens.primary);
    root.style.setProperty('--color-primary-hover', tokens.primaryHover);
    root.style.setProperty('--color-soft-primary', tokens.softPrimary);
    root.style.setProperty('--color-light-primary', tokens.lightPrimary);
    root.style.setProperty('--color-accent', tokens.accent);
    root.style.setProperty('--color-bg', tokens.background);
    root.style.setProperty('--color-surface', tokens.surface);
    root.style.setProperty('--color-surface-secondary', tokens.surfaceSecondary);
    root.style.setProperty('--color-border', tokens.border);
    root.style.setProperty('--color-text-primary', tokens.textPrimary);
    root.style.setProperty('--color-text-secondary', tokens.textSecondary);
    root.style.setProperty('--radius-card', tokens.cardRadius);
    root.style.setProperty('--radius-button', tokens.buttonRadius);

    if (tokens.isDark) {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  }, [activeTheme]);

  const activateTheme = (themeId: string) => {
    const target = themes.find((t) => t.id === themeId);
    if (!target) return;

    setActiveThemeId(themeId);
    localStorage.setItem(STORAGE_ACTIVE_THEME_ID, themeId);

    const updated = themes.map((t) => ({
      ...t,
      isActive: t.id === themeId
    }));
    setThemes(updated);
    localStorage.setItem(STORAGE_THEMES_KEY, JSON.stringify(updated));

    logAuditEvent({
      action: 'THEME_ACTIVATED',
      entityType: 'theme',
      entityName: target.name,
      details: `Activated theme version ${target.version} (${target.category})`,
      severity: 'success'
    });
  };

  const installTheme = (manifest: ThemeManifest): boolean => {
    // Check if ID already exists
    const exists = themes.some((t) => t.id === manifest.id);
    let updated: ThemeManifest[];

    if (exists) {
      updated = themes.map((t) => (t.id === manifest.id ? manifest : t));
    } else {
      updated = [...themes, manifest];
    }

    setThemes(updated);
    localStorage.setItem(STORAGE_THEMES_KEY, JSON.stringify(updated));

    logAuditEvent({
      action: 'THEME_INSTALLED',
      entityType: 'theme',
      entityName: manifest.name,
      details: `Installed theme version ${manifest.version} by ${manifest.author}`,
      severity: 'success'
    });
    return true;
  };

  const deleteTheme = (themeId: string): boolean => {
    if (themeId === 'theme-rose-blush') {
      alert('The core default theme cannot be deleted.');
      return false;
    }

    const target = themes.find((t) => t.id === themeId);
    if (!target) return false;

    const filtered = themes.filter((t) => t.id !== themeId);
    setThemes(filtered);
    localStorage.setItem(STORAGE_THEMES_KEY, JSON.stringify(filtered));

    if (activeThemeId === themeId) {
      activateTheme('theme-rose-blush');
    }

    logAuditEvent({
      action: 'THEME_DELETED',
      entityType: 'theme',
      entityName: target.name,
      details: `Deleted theme ${target.name}`,
      severity: 'warning'
    });
    return true;
  };

  const customizeTheme = (themeId: string, updatedTokens: Partial<ThemeTokens>) => {
    const updated = themes.map((t) => {
      if (t.id === themeId) {
        return {
          ...t,
          tokens: {
            ...t.tokens,
            ...updatedTokens
          },
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    });

    setThemes(updated);
    localStorage.setItem(STORAGE_THEMES_KEY, JSON.stringify(updated));

    logAuditEvent({
      action: 'THEME_CUSTOMIZED',
      entityType: 'theme',
      entityName: themes.find(t => t.id === themeId)?.name || 'Theme',
      details: `Customized CSS tokens (primary: ${updatedTokens.primary || 'unchanged'})`,
      severity: 'info'
    });
  };

  const rollbackTheme = (themeId: string) => {
    const defaultPreset = DEFAULT_THEMES.find((t) => t.id === themeId);
    if (!defaultPreset) return;

    const updated = themes.map((t) => (t.id === themeId ? defaultPreset : t));
    setThemes(updated);
    localStorage.setItem(STORAGE_THEMES_KEY, JSON.stringify(updated));

    logAuditEvent({
      action: 'THEME_ROLLBACK',
      entityType: 'theme',
      entityName: defaultPreset.name,
      details: `Rolled back theme to original default preset tokens`,
      severity: 'info'
    });
  };

  const exportTheme = (themeId: string): string => {
    const target = themes.find((t) => t.id === themeId);
    if (!target) return '';
    return JSON.stringify(target, null, 2);
  };

  return (
    <ThemeContext.Provider
      value={{
        themes,
        activeTheme,
        activateTheme,
        installTheme,
        deleteTheme,
        customizeTheme,
        rollbackTheme,
        exportTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
