import { ThemeManifest } from './theme-types';
import { PluginManifest, AuditLogEntry } from './plugin-types';
import { INITIAL_AUDIT_LOGS } from './default-extensions';

const STORAGE_AUDIT_LOGS_KEY = 'creatorpulse_audit_logs';

/**
 * Logs a new action to the platform audit ledger.
 */
export function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'user' | 'role'> & { user?: string; role?: string }) {
  if (typeof window === 'undefined') return;

  try {
    const existingRaw = localStorage.getItem(STORAGE_AUDIT_LOGS_KEY);
    const logs: AuditLogEntry[] = existingRaw ? JSON.parse(existingRaw) : INITIAL_AUDIT_LOGS;

    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      action: entry.action,
      entityType: entry.entityType,
      entityName: entry.entityName,
      details: entry.details,
      user: entry.user || 'Elena Rostova',
      role: entry.role || 'admin',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      severity: entry.severity
    };

    const updated = [newEntry, ...logs.slice(0, 99)]; // retain latest 100 entries
    localStorage.setItem(STORAGE_AUDIT_LOGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('creatorpulse_audit_log_updated', { detail: newEntry }));
  } catch (e) {
    console.error('Failed to log audit event', e);
  }
}

/**
 * Retrieves all platform audit logs.
 */
export function getAuditLogs(): AuditLogEntry[] {
  if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_AUDIT_LOGS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_AUDIT_LOGS;
  } catch (e) {
    return INITIAL_AUDIT_LOGS;
  }
}

interface RawThemeManifest {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  version?: unknown;
  author?: unknown;
  authorUrl?: unknown;
  previewImageUrl?: unknown;
  category?: unknown;
  tags?: unknown;
  minAppVersion?: unknown;
  tokens?: unknown;
  settings?: unknown;
  changelog?: unknown;
  isDefault?: unknown;
}

/**
 * Validates a Theme package manifest object.
 */
export function validateThemePackage(manifest: unknown): { valid: boolean; error?: string; theme?: ThemeManifest } {
  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, error: 'Invalid manifest format. JSON object expected.' };
  }

  const pkg = manifest as RawThemeManifest;

  if (!pkg.name || typeof pkg.name !== 'string') {
    return { valid: false, error: 'Missing or invalid theme "name".' };
  }

  if (!pkg.version || typeof pkg.version !== 'string') {
    return { valid: false, error: 'Missing or invalid theme "version".' };
  }

  if (!pkg.tokens || typeof pkg.tokens !== 'object') {
    return { valid: false, error: 'Missing theme "tokens" design palette.' };
  }

  const tokens = pkg.tokens as Record<string, unknown>;
  if (!tokens.primary || !tokens.background || !tokens.surface) {
    return { valid: false, error: 'Theme tokens must define primary, background, and surface colors.' };
  }

  const settings = (pkg.settings as Record<string, unknown>) || {};

  const validatedTheme: ThemeManifest = {
    id: (pkg.id as string) || `theme-${Date.now()}`,
    name: pkg.name,
    slug: (pkg.slug as string) || pkg.name.toLowerCase().replace(/[^a-z0-9_]/g, '-'),
    description: (pkg.description as string) || 'Custom installed CreatorPulse frontend theme.',
    version: pkg.version,
    author: (pkg.author as string) || 'Custom Developer',
    authorUrl: (pkg.authorUrl as string) || '',
    previewImageUrl: (pkg.previewImageUrl as string) || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600',
    category: (pkg.category as ThemeManifest['category']) || 'Modern Light',
    tags: Array.isArray(pkg.tags) ? (pkg.tags as string[]) : ['Custom', 'User-Installed'],
    minAppVersion: (pkg.minAppVersion as string) || '1.0.0',
    isDefault: false,
    tokens: {
      primary: tokens.primary as string,
      primaryHover: (tokens.primaryHover as string) || (tokens.primary as string),
      softPrimary: (tokens.softPrimary as string) || '#FCE7F3',
      lightPrimary: (tokens.lightPrimary as string) || '#FDF2F8',
      accent: (tokens.accent as string) || '#F43F5E',
      background: tokens.background as string,
      surface: tokens.surface as string,
      surfaceSecondary: (tokens.surfaceSecondary as string) || '#FFF1F7',
      border: (tokens.border as string) || '#F3DCE8',
      textPrimary: (tokens.textPrimary as string) || '#18181B',
      textSecondary: (tokens.textSecondary as string) || '#71717A',
      textMuted: (tokens.textMuted as string) || '#A1A1AA',
      cardRadius: (tokens.cardRadius as string) || '20px',
      buttonRadius: (tokens.buttonRadius as string) || '14px',
      fontFamily: (tokens.fontFamily as string) || 'Plus Jakarta Sans, sans-serif',
      fontHeading: (tokens.fontHeading as string) || 'Plus Jakarta Sans, sans-serif',
      isDark: Boolean(tokens.isDark)
    },
    settings: {
      logoUrl: (settings.logoUrl as string) || '',
      faviconUrl: (settings.faviconUrl as string) || '',
      containerWidth: (settings.containerWidth as ThemeManifest['settings']['containerWidth']) || 'max-w-7xl',
      buttonStyle: (settings.buttonStyle as ThemeManifest['settings']['buttonStyle']) || 'gradient-glow',
      animationIntensity: (settings.animationIntensity as ThemeManifest['settings']['animationIntensity']) || 'normal',
      cardShadow: (settings.cardShadow as ThemeManifest['settings']['cardShadow']) || 'soft-pink'
    },
    changelog: Array.isArray(pkg.changelog) ? (pkg.changelog as ThemeManifest['changelog']) : [
      { version: pkg.version, date: new Date().toISOString().split('T')[0], changes: ['Initial custom install'] }
    ],
    isCustom: true,
    installedAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };

  return { valid: true, theme: validatedTheme };
}

interface RawPluginManifest {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  version?: unknown;
  author?: unknown;
  authorUrl?: unknown;
  iconUrl?: unknown;
  category?: unknown;
  tags?: unknown;
  minAppVersion?: unknown;
  permissions?: unknown;
  hooks?: unknown;
  settingsSchema?: unknown;
  settingsValues?: unknown;
  changelog?: unknown;
  autoUpdate?: unknown;
}

/**
 * Validates a Plugin package manifest object.
 */
export function validatePluginPackage(manifest: unknown): { valid: boolean; error?: string; plugin?: PluginManifest } {
  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, error: 'Invalid manifest format. JSON object expected.' };
  }

  const pkg = manifest as RawPluginManifest;

  if (!pkg.name || typeof pkg.name !== 'string') {
    return { valid: false, error: 'Missing or invalid plugin "name".' };
  }

  if (!pkg.version || typeof pkg.version !== 'string') {
    return { valid: false, error: 'Missing or invalid plugin "version".' };
  }

  if (!Array.isArray(pkg.hooks)) {
    return { valid: false, error: 'Plugin must declare an array of registered "hooks".' };
  }

  const validatedPlugin: PluginManifest = {
    id: (pkg.id as string) || `plugin-${Date.now()}`,
    name: pkg.name,
    slug: (pkg.slug as string) || pkg.name.toLowerCase().replace(/[^a-z0-9_]/g, '-'),
    description: (pkg.description as string) || 'Custom installed CreatorPulse add-on.',
    version: pkg.version,
    author: (pkg.author as string) || 'Third-Party Developer',
    authorUrl: (pkg.authorUrl as string) || '',
    iconUrl: (pkg.iconUrl as string) || '🔌',
    category: (pkg.category as PluginManifest['category']) || 'Community & Media',
    tags: Array.isArray(pkg.tags) ? (pkg.tags as string[]) : ['Add-on', 'Custom'],
    minAppVersion: (pkg.minAppVersion as string) || '1.0.0',
    permissions: Array.isArray(pkg.permissions) ? (pkg.permissions as PluginManifest['permissions']) : [],
    hooks: pkg.hooks as PluginManifest['hooks'],
    settingsSchema: Array.isArray(pkg.settingsSchema) ? (pkg.settingsSchema as PluginManifest['settingsSchema']) : [],
    settingsValues: typeof pkg.settingsValues === 'object' ? (pkg.settingsValues as PluginManifest['settingsValues']) : {},
    changelog: Array.isArray(pkg.changelog) ? (pkg.changelog as PluginManifest['changelog']) : [
      { version: pkg.version, date: new Date().toISOString().split('T')[0], changes: ['Initial custom installation'] }
    ],
    isEnabled: false,
    autoUpdate: Boolean(pkg.autoUpdate),
    installedAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };

  return { valid: true, plugin: validatedPlugin };
}
