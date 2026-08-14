import { PluginManifest } from '@/lib/extensions/plugin-types';
import manifest from './manifest.json';

export interface PluginLifecycleContext {
  pluginId: string;
  version: string;
}

export const pluginConfig = {
  manifest: manifest as unknown as PluginManifest,
  onInstall: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] Virtual Gifts installed.`);
    return { success: true };
  },
  onActivate: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] Virtual Gifts activated.`);
    return { success: true };
  },
  onDeactivate: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] Virtual Gifts deactivated.`);
    return { success: true };
  },
  onUpdate: async (ctx: PluginLifecycleContext, fromVersion: string) => {
    console.log(`[Plugin: ${ctx.pluginId}] Updated from ${fromVersion} to ${ctx.version}`);
    return { success: true };
  },
  onUninstall: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] Uninstalled.`);
    return { success: true };
  }
};

export default pluginConfig;
