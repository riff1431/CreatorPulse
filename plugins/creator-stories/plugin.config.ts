import { PluginManifest } from '@/lib/extensions/plugin-types';
import manifest from './manifest.json';

export interface PluginLifecycleContext {
  pluginId: string;
  version: string;
}

export const pluginConfig = {
  manifest: manifest as unknown as PluginManifest,
  onInstall: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] Stories engine installed and migrations prepared.`);
    return { success: true };
  },
  onActivate: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] Stories engine activated.`);
    return { success: true };
  },
  onDeactivate: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] Stories engine deactivated.`);
    return { success: true };
  },
  onUpdate: async (ctx: PluginLifecycleContext, fromVersion: string) => {
    console.log(`[Plugin: ${ctx.pluginId}] Updated from ${fromVersion} to ${ctx.version}`);
    return { success: true };
  },
  onUninstall: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] Stories engine uninstalled.`);
    return { success: true };
  }
};

export default pluginConfig;
