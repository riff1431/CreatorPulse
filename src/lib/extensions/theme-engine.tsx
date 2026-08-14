'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
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
  previewTheme: ThemeManifest | null;
  setPreviewTheme: (theme: ThemeManifest | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_THEMES_KEY = 'creatorpulse_themes';
const STORAGE_ACTIVE_THEME_ID = 'creatorpulse_active_theme_id';

// Standard fixed Admin Control Panel tokens (Never altered by frontend themes)
export const ADMIN_LOCKED_TOKENS: ThemeTokens = {
  primary: '#EC4899',
  primaryHover: '#DB2777',
  softPrimary: '#FCE7F3',
  lightPrimary: '#FDF2F8',
  accent: '#F43F5E',
  background: '#FFF9FC',
  surface: '#FFFFFF',
  surfaceSecondary: '#FFF1F7',
  border: '#F3DCE8',
  textPrimary: '#18181B',
  textSecondary: '#71717A',
  textMuted: '#A1A1AA',
  cardRadius: '20px',
  buttonRadius: '14px',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  isDark: false
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [themes, setThemes] = useState<ThemeManifest[]>(DEFAULT_THEMES);
  const [activeThemeId, setActiveThemeId] = useState<string>('theme-rose-blush');
  const [previewTheme, setPreviewTheme] = useState<ThemeManifest | null>(null);  // Load from localStorage on mount
  useEffect(() => {
    const initThemes = () => {
      try {
        const storedThemesRaw = localStorage.getItem(STORAGE_THEMES_KEY);
        const storedActiveId = localStorage.getItem(STORAGE_ACTIVE_THEME_ID);

        let currentThemes = DEFAULT_THEMES;
        if (storedThemesRaw) {
          currentThemes = JSON.parse(storedThemesRaw);
          setThemes(currentThemes);
        }

        if (storedActiveId && currentThemes.some((t) => t.id === storedActiveId)) {
          setActiveThemeId(storedActiveId);
        } else {
          setActiveThemeId('theme-rose-blush');
        }
      } catch (e) {
        console.error('Failed to load themes from storage', e);
      }
    };
    const timer = setTimeout(initThemes, 0);
    return () => clearTimeout(timer);
  }, []);
  const activeTheme = themes.find((t) => t.id === activeThemeId) || themes[0] || DEFAULT_THEMES[0];
  const effectiveTheme = previewTheme || activeTheme;

  // Apply CSS custom properties dynamically with strict ADMIN ISOLATION
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const isAdminRoute = pathname?.startsWith('/admin');

    if (isAdminRoute) {
      // Keep Admin Panel strictly locked to standard Admin tokens
      const adminTokens = ADMIN_LOCKED_TOKENS;
      root.style.setProperty('--color-primary', adminTokens.primary);
      root.style.setProperty('--color-primary-hover', adminTokens.primaryHover);
      root.style.setProperty('--color-soft-primary', adminTokens.softPrimary);
      root.style.setProperty('--color-light-primary', adminTokens.lightPrimary);
      root.style.setProperty('--color-accent', adminTokens.accent);
      root.style.setProperty('--color-bg', adminTokens.background);
      root.style.setProperty('--color-surface', adminTokens.surface);
      root.style.setProperty('--color-surface-secondary', adminTokens.surfaceSecondary);
      root.style.setProperty('--color-border', adminTokens.border);
      root.style.setProperty('--color-text-primary', adminTokens.textPrimary);
      root.style.setProperty('--color-text-secondary', adminTokens.textSecondary);
      root.style.setProperty('--radius-card', adminTokens.cardRadius);
      root.style.setProperty('--radius-button', adminTokens.buttonRadius);
      root.classList.remove('dark-theme');
      root.classList.add('admin-isolated');
    } else {
      // Apply active Frontend theme tokens across public & user portals
      const tokens = effectiveTheme.tokens;
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

      root.classList.remove('admin-isolated');
      if (tokens.isDark) {
        root.classList.add('dark-theme');
      } else {
        root.classList.remove('dark-theme');
      }
    }
  }, [effectiveTheme, pathname]);

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
      details: `Activated frontend theme version ${target.version} (${target.category})`,
      severity: 'success'
    });
  };

  const installTheme = (manifest: ThemeManifest): boolean => {
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
      details: `Installed frontend theme version ${manifest.version} by ${manifest.author}`,
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
      details: `Deleted frontend theme ${target.name}`,
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
      entityName: themes.find((t) => t.id === themeId)?.name || 'Theme',
      details: `Customized frontend tokens (primary: ${updatedTokens.primary || 'unchanged'})`,
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
      details: `Rolled back frontend theme to original default preset tokens`,
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
        exportTheme,
        previewTheme,
        setPreviewTheme
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
