import { PluginManifest } from '@/lib/extensions/plugin-types';
import manifest from './manifest.json';

export interface PluginLifecycleContext {
  pluginId: string;
  version: string;
}

/**
 * Starter Plugin Configuration & Lifecycle Handlers
 * Similar to WordPress register_activation_hook / register_deactivation_hook
 */
export const pluginConfig = {
  manifest: manifest as unknown as PluginManifest,
  
  onInstall: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] onInstall executed.`);
    return { success: true };
  },
  
  onActivate: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] onActivate executed.`);
    return { success: true };
  },
  
  onDeactivate: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] onDeactivate executed.`);
    return { success: true };
  },
  
  onUpdate: async (ctx: PluginLifecycleContext, fromVersion: string) => {
    console.log(`[Plugin: ${ctx.pluginId}] onUpdate from ${fromVersion} to ${ctx.version}`);
    return { success: true };
  },
  
  onUninstall: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] onUninstall executed.`);
    return { success: true };
  }
};

export default pluginConfig;
