import { PluginManifest, PluginHookType } from '@/lib/extensions/plugin-types';
import { DISCOVERED_PLUGINS, DISCOVERED_PLUGIN_MANIFESTS } from './registry';

export interface PluginExecutionResult {
  success: boolean;
  error?: string;
}

export class PluginLoader {
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
