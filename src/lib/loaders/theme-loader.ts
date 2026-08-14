import { ThemeManifest, ThemeTokens, ThemeVisualSettings } from '@/lib/extensions/theme-types';
import { DISCOVERED_THEMES } from './registry';

export const CURRENT_APP_VERSION = '1.0.0';

export class ThemeLoader {
  private static defaultThemeSlug = 'blush-core';

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
   * Discover and return all available themes
   */
  public static discoverThemes(storedThemes?: ThemeManifest[]): ThemeManifest[] {
    const discovered = [...DISCOVERED_THEMES];
    if (!storedThemes || storedThemes.length === 0) {
      return discovered;
    }

    // Merge stored custom themes / updates
    const themeMap = new Map<string, ThemeManifest>();
    discovered.forEach((t) => themeMap.set(t.id, t));
    storedThemes.forEach((t) => themeMap.set(t.id, { ...themeMap.get(t.id), ...t }));

    // Ensure Blush Core default theme is permanently present
    if (!themeMap.has('theme-blush-core')) {
      themeMap.set('theme-blush-core', DISCOVERED_THEMES[0]);
    }

    return Array.from(themeMap.values());
  }

  /**
   * Get the active theme with safe fallback to Blush Core
   */
  public static resolveActiveTheme(themes: ThemeManifest[], activeId: string): ThemeManifest {
    const active = themes.find((t) => t.id === activeId);
    if (active) return active;
    
    const fallback = themes.find((t) => t.slug === this.defaultThemeSlug || t.id === 'theme-blush-core');
    return fallback || DISCOVERED_THEMES[0];
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
}
