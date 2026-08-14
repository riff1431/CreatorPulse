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

/**
 * Validates a Theme package manifest object.
 */
export function validateThemePackage(manifest: any): { valid: boolean; error?: string; theme?: ThemeManifest } {
  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, error: 'Invalid manifest format. JSON object expected.' };
  }

  if (!manifest.name || typeof manifest.name !== 'string') {
    return { valid: false, error: 'Missing or invalid theme "name".' };
  }

  if (!manifest.version || typeof manifest.version !== 'string') {
    return { valid: false, error: 'Missing or invalid theme "version".' };
  }

  if (!manifest.tokens || typeof manifest.tokens !== 'object') {
    return { valid: false, error: 'Missing theme "tokens" design palette.' };
  }

  const { tokens } = manifest;
  if (!tokens.primary || !tokens.background || !tokens.surface) {
    return { valid: false, error: 'Theme tokens must define primary, background, and surface colors.' };
  }

  const validatedTheme: ThemeManifest = {
    id: manifest.id || `theme-${Date.now()}`,
    name: manifest.name,
    slug: manifest.slug || manifest.name.toLowerCase().replace(/[^a-z0-9_]/g, '-'),
    description: manifest.description || 'Custom installed CreatorPulse theme.',
    version: manifest.version,
    author: manifest.author || 'Custom Developer',
    authorUrl: manifest.authorUrl || '',
    previewImageUrl: manifest.previewImageUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600',
    category: manifest.category || 'Modern Light',
    tags: Array.isArray(manifest.tags) ? manifest.tags : ['Custom', 'User-Installed'],
    minAppVersion: manifest.minAppVersion || '1.0.0',
    tokens: {
      primary: tokens.primary,
      primaryHover: tokens.primaryHover || tokens.primary,
      softPrimary: tokens.softPrimary || '#FCE7F3',
      lightPrimary: tokens.lightPrimary || '#FDF2F8',
      accent: tokens.accent || '#F43F5E',
      background: tokens.background,
      surface: tokens.surface,
      surfaceSecondary: tokens.surfaceSecondary || '#FFF1F7',
      border: tokens.border || '#F3DCE8',
      textPrimary: tokens.textPrimary || '#18181B',
      textSecondary: tokens.textSecondary || '#71717A',
      textMuted: tokens.textMuted || '#A1A1AA',
      cardRadius: tokens.cardRadius || '20px',
      buttonRadius: tokens.buttonRadius || '14px',
      fontFamily: tokens.fontFamily || 'Plus Jakarta Sans, sans-serif',
      isDark: Boolean(tokens.isDark)
    },
    changelog: Array.isArray(manifest.changelog) ? manifest.changelog : [
      { version: manifest.version, date: new Date().toISOString().split('T')[0], changes: ['Initial custom install'] }
    ],
    isCustom: true,
    installedAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };

  return { valid: true, theme: validatedTheme };
}

/**
 * Validates a Plugin package manifest object.
 */
export function validatePluginPackage(manifest: any): { valid: boolean; error?: string; plugin?: PluginManifest } {
  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, error: 'Invalid manifest format. JSON object expected.' };
  }

  if (!manifest.name || typeof manifest.name !== 'string') {
    return { valid: false, error: 'Missing or invalid plugin "name".' };
  }

  if (!manifest.version || typeof manifest.version !== 'string') {
    return { valid: false, error: 'Missing or invalid plugin "version".' };
  }

  if (!Array.isArray(manifest.hooks)) {
    return { valid: false, error: 'Plugin must declare an array of registered "hooks".' };
  }

  const validatedPlugin: PluginManifest = {
    id: manifest.id || `plugin-${Date.now()}`,
    name: manifest.name,
    slug: manifest.slug || manifest.name.toLowerCase().replace(/[^a-z0-9_]/g, '-'),
    description: manifest.description || 'Custom installed CreatorPulse add-on.',
    version: manifest.version,
    author: manifest.author || 'Third-Party Developer',
    authorUrl: manifest.authorUrl || '',
    iconUrl: manifest.iconUrl || '🔌',
    category: manifest.category || 'Community & Media',
    tags: Array.isArray(manifest.tags) ? manifest.tags : ['Add-on', 'Custom'],
    minAppVersion: manifest.minAppVersion || '1.0.0',
    permissions: Array.isArray(manifest.permissions) ? manifest.permissions : [],
    hooks: manifest.hooks,
    settingsSchema: Array.isArray(manifest.settingsSchema) ? manifest.settingsSchema : [],
    settingsValues: typeof manifest.settingsValues === 'object' ? manifest.settingsValues : {},
    changelog: Array.isArray(manifest.changelog) ? manifest.changelog : [
      { version: manifest.version, date: new Date().toISOString().split('T')[0], changes: ['Initial custom installation'] }
    ],
    isEnabled: false,
    autoUpdate: Boolean(manifest.autoUpdate),
    installedAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };

  return { valid: true, plugin: validatedPlugin };
}
