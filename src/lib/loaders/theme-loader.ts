import { ThemeManifest, ThemeTokens, ThemeVisualSettings } from '@/lib/extensions/theme-types';
import { DISCOVERED_THEMES } from './registry';

export const CURRENT_APP_VERSION = '1.2.0';

export const STANDARD_THEME_FOLDERS = [
  'pages',
  'layouts',
  'components',
  'icons',
  'images',
  'fonts',
  'styles',
  'css',
  'js',
  'animations',
  'assets',
  'templates',
  'partials',
  'hooks',
  'config',
  'locales',
  'preview'
] as const;

export interface ThemePackageConfig {
  manifest: ThemeManifest;
  onInit?: () => void | Promise<void>;
  onActivate?: () => void | Promise<void>;
  onDeactivate?: () => void | Promise<void>;
}

export class ThemeLoader {
  private static defaultThemeSlug = 'default-theme';

  /**
   * Standard folder list for Theme SDK v1.0 compliance
   */
  public static getStandardFolders(): readonly string[] {
    return STANDARD_THEME_FOLDERS;
  }

  /**
   * Validate a theme manifest for required fields and structure
   */
  public static validateManifest(manifest: Partial<ThemeManifest>): { valid: boolean; error?: string } {
    if (!manifest.id || typeof manifest.id !== 'string') {
      return { valid: false, error: 'Theme ID is missing or invalid' };
    }
    if (!manifest.name || typeof manifest.name !== 'string') {
      return { valid: false, error: 'Theme name is missing or invalid' };
    }
    if (!manifest.slug || typeof manifest.slug !== 'string') {
      return { valid: false, error: 'Theme slug is missing or invalid' };
    }
    if (!manifest.version || typeof manifest.version !== 'string') {
      return { valid: false, error: 'Theme version is missing or invalid' };
    }
    if (!manifest.tokens || typeof manifest.tokens !== 'object') {
      return { valid: false, error: 'Theme tokens object is required' };
    }
    return { valid: true };
  }

  /**
   * Validate directory compliance for a theme package
   */
  public static validateDirectoryStructure(folderNames: string[]): { compliant: boolean; missingFolders: string[] } {
    const present = new Set(folderNames);
    const missing = STANDARD_THEME_FOLDERS.filter(f => !present.has(f));
    return {
      compliant: missing.length === 0,
      missingFolders: missing
    };
  }

  /**
   * Discover and return all available themes based on disk scan and legitimate custom themes
   */
  public static discoverThemes(baseThemes: ThemeManifest[] = DISCOVERED_THEMES, storedThemes?: ThemeManifest[]): ThemeManifest[] {
    const themeMap = new Map<string, ThemeManifest>();
    baseThemes.forEach((t) => themeMap.set(t.id, t));

    if (storedThemes && Array.isArray(storedThemes)) {
      // Filter out legacy deleted theme IDs
      const legacyIds = new Set(['theme-blush-core', 'theme-cyber-glow', 'theme-rose-flow', 'theme-frosted-glass', 'theme-midnight-dark']);

      storedThemes.forEach((stored) => {
        if (themeMap.has(stored.id)) {
          // Merge user-customized tokens & visual settings onto disk theme
          const existing = themeMap.get(stored.id)!;
          themeMap.set(stored.id, {
            ...existing,
            tokens: stored.tokens ? { ...existing.tokens, ...stored.tokens } : existing.tokens,
            settings: stored.settings ? { ...existing.settings, ...stored.settings } : existing.settings,
            isActive: stored.isActive ?? existing.isActive,
          });
        } else if (stored.isCustom && !legacyIds.has(stored.id)) {
          // Retain genuine custom imported themes
          themeMap.set(stored.id, stored);
        }
      });
    }

    // Ensure official default theme is permanently present
    if (!themeMap.has('theme-default-theme') && DISCOVERED_THEMES.length > 0) {
      themeMap.set('theme-default-theme', DISCOVERED_THEMES[0]);
    }

    return Array.from(themeMap.values());
  }

  /**
   * Get the active theme with safe fallback to Official Default Theme
   */
  public static resolveActiveTheme(themes: ThemeManifest[], activeId: string): ThemeManifest {
    const active = themes.find((t) => t.id === activeId);
    if (active) return active;
    
    const fallback = themes.find((t) => t.isDefault || t.slug === this.defaultThemeSlug || t.id === 'theme-default-theme');
    return fallback || themes[0] || DISCOVERED_THEMES[0];
  }

  /**
   * Apply CSS variables dynamically to the document root
   */
  public static applyThemeTokens(tokens: ThemeTokens, themeId: string): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-theme', themeId);
    root.style.setProperty('--theme-primary', tokens.primary);
    root.style.setProperty('--theme-primary-hover', tokens.primaryHover || tokens.primary);
    root.style.setProperty('--theme-soft-primary', tokens.softPrimary || '#FCE7F3');
    root.style.setProperty('--theme-light-primary', tokens.lightPrimary || '#FDF2F8');
    root.style.setProperty('--theme-accent', tokens.accent || '#F43F5E');
    root.style.setProperty('--theme-bg', tokens.background || '#FFF9FC');
    root.style.setProperty('--theme-surface', tokens.surface || '#FFFFFF');
    root.style.setProperty('--theme-surface-secondary', tokens.surfaceSecondary || '#FFF1F7');
    root.style.setProperty('--theme-border', tokens.border || '#F3DCE8');
    root.style.setProperty('--theme-text-primary', tokens.textPrimary || '#18181B');
    root.style.setProperty('--theme-text-secondary', tokens.textSecondary || '#71717A');
    root.style.setProperty('--theme-text-muted', tokens.textMuted || '#A1A1AA');
    root.style.setProperty('--theme-card-radius', tokens.cardRadius || '20px');
    root.style.setProperty('--theme-button-radius', tokens.buttonRadius || '14px');
    root.style.setProperty('--theme-font-family', tokens.fontFamily || 'Plus Jakarta Sans, sans-serif');

    if (tokens.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  /**
   * Validate theme overrides against Theme SDK standards
   */
  public static validateOverrides(manifest: ThemeManifest) {
    const { themeRegistry } = require('@/lib/extensions/theme-registry');
    return themeRegistry.validateThemeOverrides(manifest);
  }
}

