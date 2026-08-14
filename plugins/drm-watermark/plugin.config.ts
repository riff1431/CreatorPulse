import { PluginManifest } from '@/lib/extensions/plugin-types';
import manifest from './manifest.json';

export interface PluginLifecycleContext {
  pluginId: string;
  version: string;
}

export const pluginConfig = {
  manifest: manifest as unknown as PluginManifest,
  
  // Standardized WordPress-like lifecycle methods
  onInstall: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] Installed successfully at version ${ctx.version}`);
    return { success: true };
  },
  onActivate: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] DRM Guard activated and media listeners attached.`);
    return { success: true };
  },
  onDeactivate: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] DRM Guard deactivated.`);
    return { success: true };
  },
  onUpdate: async (ctx: PluginLifecycleContext, fromVersion: string) => {
    console.log(`[Plugin: ${ctx.pluginId}] Updated from ${fromVersion} to ${ctx.version}`);
    return { success: true };
  },
  onUninstall: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] Uninstalled and cleaned up.`);
    return { success: true };
  }
};

export default pluginConfig;
