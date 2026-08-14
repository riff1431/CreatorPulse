import { PluginManifest, PluginHookType } from '@/lib/extensions/plugin-types';
import { DISCOVERED_PLUGINS, DISCOVERED_PLUGIN_MANIFESTS } from './registry';

export const STANDARD_PLUGIN_FOLDERS = [
  'client',
  'server',
  'api',
  'components',
  'pages',
  'routes',
  'hooks',
  'services',
  'database',
  'migrations',
  'settings',
  'permissions',
  'icons',
  'images',
  'css',
  'js',
  'assets',
  'locales',
  'jobs',
  'events',
  'webhooks',
  'tests',
  'docs'
] as const;

export interface PluginExecutionContext {
  pluginId: string;
  version: string;
}

export interface PluginPackageConfig {
  manifest: PluginManifest;
  onInstall?: (ctx?: PluginExecutionContext) => void | Promise<void>;
  onActivate?: (ctx?: PluginExecutionContext) => void | Promise<void>;
  onDeactivate?: (ctx?: PluginExecutionContext) => void | Promise<void>;
  onUpdate?: (ctx?: PluginExecutionContext, fromVersion?: string) => void | Promise<void>;
  onUninstall?: (ctx?: PluginExecutionContext) => void | Promise<void>;
}

export interface PluginExecutionResult {
  success: boolean;
  error?: string;
}

export class PluginLoader {
  /**
   * Standard folder list for Plugin SDK v1.0 compliance
   */
  public static getStandardFolders(): readonly string[] {
    return STANDARD_PLUGIN_FOLDERS;
  }

  /**
   * Validate a plugin manifest for required properties
   */
  public static validateManifest(manifest: Partial<PluginManifest>): { valid: boolean; error?: string } {
    if (!manifest.id || typeof manifest.id !== 'string') {
      return { valid: false, error: 'Plugin ID is missing or invalid' };
    }
    if (!manifest.name || typeof manifest.name !== 'string') {
      return { valid: false, error: 'Plugin name is missing or invalid' };
    }
    if (!manifest.slug || typeof manifest.slug !== 'string') {
      return { valid: false, error: 'Plugin slug is missing or invalid' };
    }
    if (!manifest.version || typeof manifest.version !== 'string') {
      return { valid: false, error: 'Plugin version is missing or invalid' };
    }
    if (!Array.isArray(manifest.permissions)) {
      return { valid: false, error: 'Plugin permissions array is required' };
    }
    if (!Array.isArray(manifest.hooks)) {
      return { valid: false, error: 'Plugin hooks array is required' };
    }
    return { valid: true };
  }

  /**
   * Validate directory compliance for a plugin package
   */
  public static validateDirectoryStructure(folderNames: string[]): { compliant: boolean; missingFolders: string[] } {
    const present = new Set(folderNames);
    const missing = STANDARD_PLUGIN_FOLDERS.filter(f => !present.has(f));
    return {
      compliant: missing.length === 0,
      missingFolders: missing
    };
  }

  /**
   * Discover and return all available plugins
   */
  public static discoverPlugins(storedPlugins?: PluginManifest[]): PluginManifest[] {
    const discovered = [...DISCOVERED_PLUGIN_MANIFESTS];
    if (!storedPlugins || storedPlugins.length === 0) {
      return discovered;
    }

    const pluginMap = new Map<string, PluginManifest>();
    discovered.forEach((p) => pluginMap.set(p.id, p));
    storedPlugins.forEach((p) => pluginMap.set(p.id, { ...pluginMap.get(p.id), ...p }));

    return Array.from(pluginMap.values());
  }

  /**
   * Execute lifecycle hook safely
   */
  public static async executeLifecycle(
    pluginId: string,
    action: 'onInstall' | 'onActivate' | 'onDeactivate' | 'onUpdate' | 'onUninstall',
    fromVersion?: string
  ): Promise<PluginExecutionResult> {
    try {
      const plugin = DISCOVERED_PLUGINS.find((p) => p.manifest.id === pluginId);
      if (!plugin) {
        return { success: true }; // Custom or dynamic plugin without code handler
      }

      const handler = (plugin as any)[action];
      if (typeof handler === 'function') {
        const ctx = { pluginId, version: plugin.manifest.version };
        const res = await handler(ctx, fromVersion || '');
        return res || { success: true };
      }
      return { success: true };
    } catch (err: any) {
      console.error(`[PluginLoader] Error executing ${action} on ${pluginId}:`, err);
      return { success: false, error: err?.message || 'Lifecycle execution failed' };
    }
  }

  /**
   * Filter active plugins that subscribe to a specific hook
   */
  public static getPluginsForHook(plugins: PluginManifest[], hook: PluginHookType): PluginManifest[] {
    return plugins.filter((p) => p.isEnabled && !p.hasError && p.hooks.includes(hook));
  }
}
