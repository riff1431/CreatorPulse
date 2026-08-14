'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeManifest, ThemeTokens, ThemeVisualSettings, ThemeBackup, ThemeOverrideValidationResult } from './theme-types';
import { DEFAULT_THEMES, THEME_LIBRARY_CATALOG, THEME_UPDATE_REGISTRY } from './default-extensions';
import { logAuditEvent, validateThemePackage } from './package-installer';
import { DISCOVERED_THEMES, DISCOVERED_PLUGIN_MANIFESTS } from '@/lib/loaders/registry';
import { ThemeLoader } from '@/lib/loaders/theme-loader';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { CompatibilityChecker } from '@/lib/loaders/compatibility-checker';
import { themeRegistry } from './theme-registry';

interface ThemeContextType {
  themes: ThemeManifest[];
  activeTheme: ThemeManifest;
  libraryThemes: ThemeManifest[];
  activateTheme: (themeId: string) => boolean;
  activateThemeWithLicense: (themeId: string, licenseKey?: string) => { success: boolean; error?: string };
  deactivateTheme: (themeId: string) => void;
  updateThemeVersion: (themeId: string) => void;
  installTheme: (manifest: ThemeManifest) => boolean;
  installFromLibrary: (themeId: string) => boolean;
  duplicateTheme: (themeId: string) => ThemeManifest | null;
  deleteTheme: (themeId: string) => { success: boolean; error?: string };
  customizeTheme: (themeId: string, updatedTokens: Partial<ThemeTokens>, updatedSettings?: Partial<ThemeVisualSettings>) => void;
  rollbackTheme: (themeId: string) => void;
  exportTheme: (themeId: string) => string;
  previewTheme: ThemeManifest | null;
  setPreviewTheme: (theme: ThemeManifest | null) => void;

  // Theme Override & Fallback System
  validateThemeOverrides: (themeId: string) => ThemeOverrideValidationResult;
  getThemeOverrideReport: (themeId: string) => ThemeOverrideValidationResult;

  // Theme Update System Addition
  checkForUpdates: () => Promise<{ foundCount: number }>;
  isCheckingUpdates: boolean;
  lastUpdateCheck: string | null;
  updateThemeWithBackup: (themeId: string) => Promise<{ success: boolean; error?: string }>;
  rollbackToBackup: (backupId: string) => { success: boolean; error?: string };
  backups: ThemeBackup[];
  deleteBackup: (backupId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_THEMES_KEY = 'creatorpulse_themes_v2';
const STORAGE_ACTIVE_THEME_ID = 'creatorpulse_active_theme_id_v2';

export const CURRENT_APP_VERSION = '1.2.0';

// Fixed administrative token variables to sandbox the Admin Console
export const ADMIN_LOCKED_TOKENS: ThemeTokens = {
  primary: '#EC4899',
  primaryHover: '#DB2777',
  softPrimary: '#FCE7F3',
  lightPrimary: '#FFF9FC',
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
  fontHeading: 'Plus Jakarta Sans, sans-serif',
  isDark: false
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { settings: siteSettings } = useSiteSettings();
  const [themes, setThemes] = useState<ThemeManifest[]>(DISCOVERED_THEMES);
  const [activeThemeId, setActiveThemeId] = useState<string>('theme-default-theme');
  const [previewTheme, setPreviewTheme] = useState<ThemeManifest | null>(null);

  // Theme Update System States
  const [backups, setBackups] = useState<ThemeBackup[]>([]);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [lastUpdateCheck, setLastUpdateCheck] = useState<string | null>(null);

  // Load dynamically from /api/admin/themes and filesystem on mount
  useEffect(() => {
    const initThemes = async () => {
      try {
        let baseThemes = DISCOVERED_THEMES;

        // Fetch live scanned themes from server
        try {
          const res = await fetch('/api/admin/themes');
          const data = await res.json();
          if (data.success && Array.isArray(data.themes) && data.themes.length > 0) {
            baseThemes = data.themes;
          }
        } catch (apiErr) {
          console.warn('[ThemeEngine] Fallback to local registry', apiErr);
        }

        const storedThemesRaw = localStorage.getItem(STORAGE_THEMES_KEY);
        const storedActiveId = localStorage.getItem(STORAGE_ACTIVE_THEME_ID);
        const storedBackupsRaw = localStorage.getItem('creatorpulse_theme_backups');
        const storedLastCheck = localStorage.getItem('creatorpulse_last_update_check');

        let storedCustom: ThemeManifest[] = [];
        if (storedThemesRaw) {
          try {
            storedCustom = JSON.parse(storedThemesRaw);
          } catch (e) {}
        }

        const mergedThemes = ThemeLoader.discoverThemes([...baseThemes, ...storedCustom]);
        setThemes(mergedThemes);

        if (storedActiveId && mergedThemes.some((t) => t.id === storedActiveId)) {
          setActiveThemeId(storedActiveId);
        } else {
          setActiveThemeId('theme-default-theme');
        }

        if (storedBackupsRaw) {
          setBackups(JSON.parse(storedBackupsRaw));
        }

        if (storedLastCheck) {
          setLastUpdateCheck(storedLastCheck);
        }
      } catch (e) {
        console.error('Failed to load themes from storage, reverting to Default Theme', e);
        setThemes(DISCOVERED_THEMES);
        setActiveThemeId('theme-default-theme');
      }
    };

    initThemes();
  }, []);

  const activeTheme = themes.find((t) => t.id === activeThemeId) || themes[0] || DEFAULT_THEMES[0];
  const effectiveTheme = previewTheme || activeTheme;

  // Apply CSS custom properties dynamically with strict ADMIN ISOLATION
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const isAdminRoute = pathname?.startsWith('/admin');
    const styleTag = document.getElementById('theme-assets-overrides');

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
      root.style.setProperty('--font-sans', adminTokens.fontFamily);
      
      // Default Spacing/Header/Sidebar variables for admin
      root.style.setProperty('--theme-spacing-base', '1rem');
      root.style.setProperty('--theme-sidebar-placement', 'left');
      root.style.setProperty('--theme-header-style', 'fixed');

      root.classList.remove('dark-theme');
      root.classList.remove('sidebar-right');
      
      // Clean up all theme slug classes and overrides
      themes.forEach((t) => root.classList.remove(`theme-${t.slug}`));
      root.classList.add('admin-isolated');
      if (styleTag) styleTag.remove();

      // Apply Favicon dynamically from Site Settings
      const faviconUrl = siteSettings.favicon_url;
      let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (faviconUrl) {
        if (!faviconLink) {
          faviconLink = document.createElement('link');
          faviconLink.rel = 'shortcut icon';
          document.getElementsByTagName('head')[0].appendChild(faviconLink);
        }
        faviconLink.href = faviconUrl;
      } else if (faviconLink) {
        faviconLink.href = '/favicon.ico';
      }
    } else {
      // Apply active Frontend theme tokens across public & user portals
      try {
        const tokens = effectiveTheme.tokens;
        const settings = effectiveTheme.settings || DEFAULT_THEMES[0].settings;

        root.style.setProperty('--color-primary', tokens.primary);
        root.style.setProperty('--color-primary-hover', tokens.primaryHover || tokens.primary);
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
        root.style.setProperty('--font-sans', tokens.fontFamily || 'Plus Jakarta Sans, sans-serif');

        // Spacing Variable
        const spacingMap = {
          compact: '0.75rem',
          standard: '1rem',
          cozy: '1.25rem',
          spacious: '1.5rem'
        };
        const spacingBase = settings.spacing ? spacingMap[settings.spacing] || '1rem' : '1rem';
        root.style.setProperty('--theme-spacing-base', spacingBase);

        // Sidebar & Header & Button style settings
        root.style.setProperty('--theme-sidebar-placement', settings.sidebarPlacement || 'left');
        if (settings.sidebarPlacement === 'right') {
          root.classList.add('sidebar-right');
        } else {
          root.classList.remove('sidebar-right');
        }
        root.style.setProperty('--theme-header-style', settings.headerStyle || 'fixed');
        root.style.setProperty('--theme-container-width', settings.containerWidth || 'max-w-7xl');
        root.style.setProperty('--theme-button-style', settings.buttonStyle || 'gradient-glow');
        root.style.setProperty('--theme-animation-intensity', settings.animationIntensity || 'normal');

        root.classList.remove('admin-isolated');
        
        // Update theme-specific classes on root
        themes.forEach((t) => root.classList.remove(`theme-${t.slug}`));
        root.classList.add(`theme-${effectiveTheme.slug}`);

        if (tokens.isDark) {
          root.classList.add('dark-theme');
        } else {
          root.classList.remove('dark-theme');
        }

        // Apply Favicon dynamically (prioritize Site Settings, then Theme settings)
        const faviconUrl = siteSettings.favicon_url || settings.faviconUrl;
        if (faviconUrl) {
          let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (!faviconLink) {
            faviconLink = document.createElement('link');
            faviconLink.rel = 'shortcut icon';
            document.getElementsByTagName('head')[0].appendChild(faviconLink);
          }
          faviconLink.href = faviconUrl;
        } else {
          const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (faviconLink) {
            faviconLink.href = '/favicon.ico';
          }
        }

        // Load fonts dynamically from Google Fonts if specified
        if (tokens.fontFamily) {
          const fontId = 'dynamic-theme-font';
          let link = document.getElementById(fontId) as HTMLLinkElement;
          const fontName = tokens.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          
          if (fontName && fontName !== 'system-ui' && fontName !== '-apple-system') {
            if (!link) {
              link = document.createElement('link');
              link.id = fontId;
              link.rel = 'stylesheet';
              document.head.appendChild(link);
            }
            const encodedFont = fontName.replace(/\s+/g, '+');
            link.href = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@300;400;500;600;700;800;900&display=swap`;
          } else if (link) {
            link.remove();
          }
        }

        // Apply theme-specific CSS Overrides
        const overrides = effectiveTheme.assets?.cssOverrides;
        if (overrides) {
          if (!styleTag) {
            const newStyleTag = document.createElement('style');
            newStyleTag.id = 'theme-assets-overrides';
            document.head.appendChild(newStyleTag);
            newStyleTag.innerHTML = overrides;
          } else {
            styleTag.innerHTML = overrides;
          }
        } else {
          if (styleTag) styleTag.remove();
        }
      } catch (err) {
        console.error('Error applying theme tokens, safely falling back to Blush Core', err);
        const fallback = DEFAULT_THEMES[0].tokens;
        root.style.setProperty('--color-primary', fallback.primary);
        root.style.setProperty('--color-bg', fallback.background);
        root.style.setProperty('--color-surface', fallback.surface);
        themes.forEach((t) => root.classList.remove(`theme-${t.slug}`));
        if (styleTag) styleTag.remove();
      }
    }
  }, [effectiveTheme, pathname, themes, siteSettings.favicon_url]);

  const activateTheme = (themeId: string): boolean => {
    const res = activateThemeWithLicense(themeId);
    return res.success;
  };

  const activateThemeWithLicense = (themeId: string, licenseKey?: string): { success: boolean; error?: string } => {
    const target = themes.find((t) => t.id === themeId);
    if (!target) return { success: false, error: 'Theme not found in installed registry.' };

    // Version compatibility check
    if (target.minAppVersion && target.minAppVersion > CURRENT_APP_VERSION) {
      return { 
        success: false, 
        error: `Cannot activate theme "${target.name}". It requires CreatorPulse v${target.minAppVersion} or higher (current: v${CURRENT_APP_VERSION}).` 
      };
    }

    // License check for custom/premium themes
    if (target.requiresLicense && !target.isDefault) {
      const keyToTest = (licenseKey || target.licenseKey || '').trim();
      // Valid license format: e.g. CP-THEME-XXXX-XXXX-XXXX or at least 12 alphanumeric characters
      const isValidKey = /^[A-Z0-9]{2,8}-[A-Z0-9]{4,8}-[A-Z0-9]{4,8}-[A-Z0-9]{4,8}$/i.test(keyToTest) || keyToTest.length >= 10;
      if (!isValidKey) {
        return {
          success: false,
          error: 'Invalid license key format. Please enter a valid CreatorPulse Theme License (e.g. CP-THEME-7X89-KL22-901B).'
        };
      }
    }

    // Dependencies Check:
    let pluginsList: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        const rawPlugins = localStorage.getItem('creatorpulse_plugins');
        if (rawPlugins) {
          pluginsList = JSON.parse(rawPlugins);
        }
      } catch (err) {
        console.error('Failed reading plugins for theme validation:', err);
      }
    }
    if (pluginsList.length === 0) {
      pluginsList = DISCOVERED_PLUGIN_MANIFESTS;
    }

    if (target.dependencies && typeof target.dependencies === 'object') {
      const deps = target.dependencies as Record<string, unknown>;
      if (deps.plugins && typeof deps.plugins === 'object') {
        const pluginsToEnable: string[] = [];
        for (const [depId, minVer] of Object.entries(deps.plugins)) {
          const dep = pluginsList.find(p => p.id === depId || p.slug === depId);
          if (!dep) {
            return {
              success: false,
              error: `Cannot activate theme "${target.name}". Required dependency plugin "${depId}" (v${minVer}+) is not installed.`
            };
          }
          if (dep.version && minVer) {
            const hasCompatibleVersion = CompatibilityChecker.compareVersions(dep.version, minVer as string);
            if (!hasCompatibleVersion) {
              return {
                success: false,
                error: `Cannot activate theme "${target.name}". Dependency plugin "${dep.name}" version is v${dep.version}, but v${minVer} or higher is required.`
              };
            }
          }
          if (!dep.isEnabled) {
            pluginsToEnable.push(dep.id);
          }
        }

        if (pluginsToEnable.length > 0) {
          const depNames = pluginsToEnable.map(id => pluginsList.find(p => p.id === id)?.name || id).join(', ');
          if (window.confirm(`Theme "${target.name}" requires the following dependency plugin(s) to be enabled: ${depNames}. Enable them automatically now?`)) {
            // Enable dependencies first
            const updatedPlugins = pluginsList.map(p => pluginsToEnable.includes(p.id) ? { ...p, isEnabled: true, updatedAt: new Date().toISOString().split('T')[0] } : p);
            localStorage.setItem('creatorpulse_plugins', JSON.stringify(updatedPlugins));
            // Trigger server toggle sync for plugins
            pluginsToEnable.forEach(id => {
              fetch('/api/admin/plugins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle', pluginId: id, isEnabled: true })
              }).catch(() => {});
            });
          } else {
            return {
              success: false,
              error: `Cannot activate theme "${target.name}" because dependency plugin(s) (${depNames}) are disabled.`
            };
          }
        }
      }
    }

    // Pre-activation Override & Fallback validation check
    const overrideValidation = themeRegistry.validateThemeOverrides(target);
    if (!overrideValidation.isValid) {
      return {
        success: false,
        error: `Cannot activate theme "${target.name}". Override validation failed: ${overrideValidation.errors.join('; ')}`
      };
    }

    setActiveThemeId(themeId);
    localStorage.setItem(STORAGE_ACTIVE_THEME_ID, themeId);

    const updated = themes.map((t) => ({
      ...t,
      isActive: t.id === themeId,
      licenseKey: t.id === themeId && licenseKey ? licenseKey : t.licenseKey,
      licenseStatus: t.id === themeId && target.requiresLicense ? ('licensed' as const) : t.licenseStatus
    }));
    setThemes(updated);
    localStorage.setItem(STORAGE_THEMES_KEY, JSON.stringify(updated));

    // Sync active theme state to server
    fetch('/api/admin/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'activate', themeId, licenseKey })
    }).catch(err => console.warn('[ThemeEngine] Server sync warning:', err));

    logAuditEvent({
      action: 'THEME_ACTIVATED',
      entityType: 'theme',
      entityName: target.name,
      details: `Activated frontend theme v${target.version} (${target.category}). Overrides: ${overrideValidation.summary.totalOverridden} custom items, ${overrideValidation.summary.totalFallback} default fallbacks.`,
      severity: 'success'
    });
    return { success: true };
  };

  const validateThemeOverrides = (themeId: string): ThemeOverrideValidationResult => {
    const target = themes.find((t) => t.id === themeId);
    if (!target) {
      return {
        isValid: false,
        themeId,
        themeSlug: themeId,
        themeName: 'Unknown Theme',
        overrides: { pages: [], layouts: [], components: [] },
        summary: { totalOverridden: 0, totalFallback: 0, hasErrors: true },
        errors: ['Theme not found in registry'],
        warnings: [],
      };
    }
    return themeRegistry.validateThemeOverrides(target);
  };

  const getThemeOverrideReport = (themeId: string): ThemeOverrideValidationResult => {
    return validateThemeOverrides(themeId);
  };

  const deactivateTheme = (themeId: string) => {
    if (themeId === 'theme-default-theme' || themeId === 'default-theme' || themeId === 'theme-blush-core') {
      alert('The core Official Default Theme cannot be deactivated without activating another theme.');
      return;
    }
    activateTheme('theme-default-theme');
  };

  const updateThemeVersion = (themeId: string) => {
    const target = themes.find((t) => t.id === themeId);
    if (!target || !target.latestVersion) return;

    const updated = themes.map((t) => {
      if (t.id === themeId) {
        return {
          ...t,
          version: t.latestVersion!,
          hasUpdate: false,
          updatedAt: new Date().toISOString().split('T')[0],
          changelog: [
            {
              version: t.latestVersion!,
              date: new Date().toISOString().split('T')[0],
              changes: ['Automatic design tokens and responsive rules upgrade']
            },
            ...t.changelog
          ]
        };
      }
      return t;
    });

    setThemes(updated);
    localStorage.setItem(STORAGE_THEMES_KEY, JSON.stringify(updated));

    logAuditEvent({
      action: 'THEME_INSTALLED',
      entityType: 'theme',
      entityName: target.name,
      details: `Updated theme from v${target.version} to v${target.latestVersion}`,
      severity: 'success'
    });
  };

  const duplicateTheme = (themeId: string): ThemeManifest | null => {
    const source = themes.find((t) => t.id === themeId);
    if (!source) return null;

    const clonedId = `theme-${source.slug}-copy-${Date.now().toString().slice(-4)}`;
    const cloned: ThemeManifest = {
      ...source,
      id: clonedId,
      name: `${source.name} (Copy)`,
      slug: `${source.slug}-copy`,
      isDefault: false,
      isCustom: true,
      isActive: false,
      installedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      changelog: [
        {
          version: '1.0.0',
          date: new Date().toISOString().split('T')[0],
          changes: [`Duplicated from ${source.name} v${source.version}`]
        },
        ...source.changelog
      ]
    };

    const updated = [...themes, cloned];
    setThemes(updated);
    localStorage.setItem(STORAGE_THEMES_KEY, JSON.stringify(updated));

    logAuditEvent({
      action: 'THEME_INSTALLED',
      entityType: 'theme',
      entityName: cloned.name,
      details: `Duplicated theme from source "${source.name}"`,
      severity: 'info'
    });
    return cloned;
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

    // Sync installed theme to server
    fetch('/api/admin/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'install', manifest })
    }).catch(err => console.warn('[ThemeEngine] Server sync warning:', err));

    logAuditEvent({
      action: 'THEME_INSTALLED',
      entityType: 'theme',
      entityName: manifest.name,
      details: `Installed frontend theme v${manifest.version} by ${manifest.author}`,
      severity: 'success'
    });
    return true;
  };

  const installFromLibrary = (themeId: string): boolean => {
    const catalogItem = THEME_LIBRARY_CATALOG.find((t) => t.id === themeId);
    if (!catalogItem) return false;

    // Validate theme structure before installation
    const validation = validateThemePackage(catalogItem);
    if (!validation.valid || !validation.theme) {
      alert(`Validation Error: ${validation.error || 'Invalid theme package structure.'}`);
      return false;
    }

    const manifest: ThemeManifest = {
      ...validation.theme,
      isActive: false,
      installedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    return installTheme(manifest);
  };

  const deleteTheme = (themeId: string): { success: boolean; error?: string } => {
    const target = themes.find((t) => t.id === themeId);
    if (!target) return { success: false, error: 'Theme not found.' };

    // Prevent deletion of Official Default Theme
    if (target.isDefault || target.id === 'theme-default-theme' || target.id === 'theme-blush-core') {
      return { 
        success: false, 
        error: 'The built-in Official Default Theme is permanent and protected from deletion.' 
      };
    }

    // Prevent deletion of currently active theme
    if (activeThemeId === themeId) {
      return { 
        success: false, 
        error: `Cannot delete "${target.name}" because it is currently the active theme. Please activate another theme (such as Default Theme) first.` 
      };
    }

    const filtered = themes.filter((t) => t.id !== themeId);
    setThemes(filtered);
    localStorage.setItem(STORAGE_THEMES_KEY, JSON.stringify(filtered));

    // Sync deletion to server to purge directory from filesystem
    fetch('/api/admin/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', themeId })
    }).catch(err => console.warn('[ThemeEngine] Server delete warning:', err));

    logAuditEvent({
      action: 'THEME_DELETED',
      entityType: 'theme',
      entityName: target.name,
      details: `Deleted custom frontend theme ${target.name}`,
      severity: 'warning'
    });
    return { success: true };
  };

  const customizeTheme = (
    themeId: string, 
    updatedTokens: Partial<ThemeTokens>, 
    updatedSettings?: Partial<ThemeVisualSettings>
  ) => {
    const updated = themes.map((t) => {
      if (t.id === themeId) {
        const customTokens = {
          ...(t.customizations?.tokens || {}),
          ...updatedTokens
        };
        const customSettings = {
          ...(t.customizations?.settings || {}),
          ...(updatedSettings || {})
        };
        return {
          ...t,
          tokens: {
            ...t.tokens,
            ...updatedTokens
          },
          settings: {
            ...t.settings,
            ...(updatedSettings || {})
          },
          customizations: {
            tokens: customTokens,
            settings: customSettings
          },
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    });

    setThemes(updated);
    localStorage.setItem(STORAGE_THEMES_KEY, JSON.stringify(updated));

    // Sync customizations to server
    fetch('/api/admin/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'customize', themeId, tokens: updatedTokens, settings: updatedSettings })
    }).catch(err => console.warn('[ThemeEngine] Server sync warning:', err));

    logAuditEvent({
      action: 'THEME_CUSTOMIZED',
      entityType: 'theme',
      entityName: themes.find(t => t.id === themeId)?.name || 'Theme',
      details: `Customized frontend design tokens & visual branding settings`,
      severity: 'info'
    });
  };

  const rollbackTheme = (themeId: string) => {
    const defaultPreset = DEFAULT_THEMES.find((t) => t.id === themeId) || DEFAULT_THEMES[0];
    const updated = themes.map((t) => (t.id === themeId ? defaultPreset : t));
    setThemes(updated);
    localStorage.setItem(STORAGE_THEMES_KEY, JSON.stringify(updated));

    logAuditEvent({
      action: 'THEME_ROLLBACK',
      entityType: 'theme',
      entityName: defaultPreset.name,
      details: `Rolled back frontend theme to initial default preset tokens`,
      severity: 'info'
    });
  };

  const exportTheme = (themeId: string): string => {
    const target = themes.find((t) => t.id === themeId);
    if (!target) return '';
    return JSON.stringify(target, null, 2);
  };

  // Theme Update System Methods
  const checkForUpdates = async (): Promise<{ foundCount: number }> => {
    setIsCheckingUpdates(true);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate check delay

    let foundCount = 0;
    const updated = themes.map((t) => {
      const updateInfo = THEME_UPDATE_REGISTRY[t.id];
      if (updateInfo && updateInfo.version && updateInfo.version !== t.version) {
        foundCount++;
        return {
          ...t,
          hasUpdate: true,
          latestVersion: updateInfo.version
        };
      }
      return t;
    });

    if (foundCount > 0) {
      setThemes(updated);
      localStorage.setItem(STORAGE_THEMES_KEY, JSON.stringify(updated));
    }

    const checkTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString();
    setLastUpdateCheck(checkTime);
    localStorage.setItem('creatorpulse_last_update_check', checkTime);
    setIsCheckingUpdates(false);

    logAuditEvent({
      action: 'THEME_CUSTOMIZED',
      entityType: 'theme',
      entityName: 'Theme Update System',
      details: `Checked for updates. Found ${foundCount} updates available.`,
      severity: 'info'
    });

    return { foundCount };
  };

  const updateThemeWithBackup = async (themeId: string): Promise<{ success: boolean; error?: string }> => {
    const target = themes.find((t) => t.id === themeId);
    if (!target) return { success: false, error: 'Theme not found.' };

    const updateInfo = THEME_UPDATE_REGISTRY[themeId];
    if (!updateInfo || !updateInfo.version) {
      return { success: false, error: 'No update available for this theme.' };
    }

    // 1. Compatibility Validation Check
    if (updateInfo.minAppVersion && updateInfo.minAppVersion > CURRENT_APP_VERSION) {
      return {
        success: false,
        error: `Incompatible update: Requires CreatorPulse v${updateInfo.minAppVersion} or higher (current: v${CURRENT_APP_VERSION}).`
      };
    }

    try {
      // 2. Create restore point (Backup)
      const backupId = `backup-${themeId}-${Date.now()}`;
      const newBackup: ThemeBackup = {
        id: backupId,
        themeId: target.id,
        themeName: target.name,
        version: target.version,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        tokens: { ...target.tokens },
        settings: { ...(target.settings || DEFAULT_THEMES[0].settings) },
        manifest: JSON.parse(JSON.stringify(target)) // deep copy
      };

      const updatedBackups = [newBackup, ...backups];
      setBackups(updatedBackups);
      localStorage.setItem('creatorpulse_theme_backups', JSON.stringify(updatedBackups));

      // 3. Merge update manifest while preserving customizations
      const customTokens = target.customizations?.tokens || {};
      const customSettings = target.customizations?.settings || {};

      const updatedManifest: ThemeManifest = {
        ...target,
        version: updateInfo.version,
        description: updateInfo.description || target.description,
        minAppVersion: updateInfo.minAppVersion || target.minAppVersion || '1.0.0',
        hasUpdate: false,
        updatedAt: new Date().toISOString().split('T')[0],
        changelog: updateInfo.changelog as any || [
          {
            version: updateInfo.version,
            date: new Date().toISOString().split('T')[0],
            changes: ['Automatic design tokens and responsive rules upgrade']
          },
          ...target.changelog
        ],
        // Preserved tokens (override update default tokens with customizations)
        tokens: {
          ...(updateInfo.tokens || target.tokens),
          ...customTokens
        },
        // Preserved settings (override update default settings with customizations)
        settings: {
          ...(updateInfo.settings || target.settings || DEFAULT_THEMES[0].settings),
          ...customSettings
        },
        // Preserve customizations history
        customizations: {
          tokens: customTokens,
          settings: customSettings
        }
      };

      // 4. If the updated theme is active, attempt to safely apply it. If it fails, revert!
      if (target.id === activeThemeId) {
        try {
          if (!updatedManifest.tokens.primary || !updatedManifest.tokens.background || !updatedManifest.tokens.surface) {
            throw new Error("Malformatted update tokens");
          }
        } catch (stylingErr) {
          // Revert backup immediately
          const rolledBackBackups = updatedBackups.filter(b => b.id !== backupId);
          setBackups(rolledBackBackups);
          localStorage.setItem('creatorpulse_theme_backups', JSON.stringify(rolledBackBackups));
          return {
            success: false,
            error: `Update failed during layout binding safety check: ${stylingErr instanceof Error ? stylingErr.message : String(stylingErr)}. Safe rollback performed.`
          };
        }
      }

      // 5. Save updated themes
      const updatedThemes = themes.map((t) => (t.id === themeId ? updatedManifest : t));
      setThemes(updatedThemes);
      localStorage.setItem(STORAGE_THEMES_KEY, JSON.stringify(updatedThemes));

      logAuditEvent({
        action: 'THEME_INSTALLED',
        entityType: 'theme',
        entityName: target.name,
        details: `Updated from v${target.version} to v${updateInfo.version} (Settings preserved. Restore point ${backupId} created).`,
        severity: 'success'
      });

      return { success: true };
    } catch (err) {
      console.error('Theme update execution failed:', err);
      return { success: false, error: `Theme update execution failed: ${err instanceof Error ? err.message : String(err)}` };
    }
  };

  const rollbackToBackup = (backupId: string): { success: boolean; error?: string } => {
    const backup = backups.find((b) => b.id === backupId);
    if (!backup) return { success: false, error: 'Backup restore point not found.' };

    try {
      const targetThemeExists = themes.some((t) => t.id === backup.themeId);
      
      let updatedThemes: ThemeManifest[];
      if (targetThemeExists) {
        updatedThemes = themes.map((t) => (t.id === backup.themeId ? backup.manifest : t));
      } else {
        updatedThemes = [...themes, backup.manifest];
      }

      setThemes(updatedThemes);
      localStorage.setItem(STORAGE_THEMES_KEY, JSON.stringify(updatedThemes));

      const remainingBackups = backups.filter((b) => b.id !== backupId);
      setBackups(remainingBackups);
      localStorage.setItem('creatorpulse_theme_backups', JSON.stringify(remainingBackups));

      logAuditEvent({
        action: 'THEME_ROLLBACK',
        entityType: 'theme',
        entityName: backup.themeName,
        details: `Rolled back to v${backup.version} using restore point ${backupId}.`,
        severity: 'info'
      });

      return { success: true };
    } catch (err) {
      console.error('Backup rollback failed:', err);
      return { success: false, error: `Rollback failed: ${err instanceof Error ? err.message : String(err)}` };
    }
  };

  const deleteBackup = (backupId: string) => {
    const updated = backups.filter((b) => b.id !== backupId);
    setBackups(updated);
    localStorage.setItem('creatorpulse_theme_backups', JSON.stringify(updated));
  };

  return (
    <ThemeContext.Provider
      value={{
        themes,
        activeTheme,
        libraryThemes: THEME_LIBRARY_CATALOG,
        activateTheme,
        activateThemeWithLicense,
        deactivateTheme,
        updateThemeVersion,
        installTheme,
        installFromLibrary,
        duplicateTheme,
        deleteTheme,
        customizeTheme,
        rollbackTheme,
        exportTheme,
        previewTheme,
        setPreviewTheme,
        validateThemeOverrides,
        getThemeOverrideReport,
        checkForUpdates,
        isCheckingUpdates,
        lastUpdateCheck,
        updateThemeWithBackup,
        rollbackToBackup,
        backups,
        deleteBackup
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
