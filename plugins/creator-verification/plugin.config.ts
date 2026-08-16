import { PluginManifest } from '@/lib/extensions/plugin-types';
import manifest from './manifest.json';

export interface PluginLifecycleContext {
  pluginId: string;
  version: string;
}

export const pluginConfig = {
  manifest: manifest as unknown as PluginManifest,
  onInstall: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] Creator Verification Manager installed v${ctx.version}.`);
    return { success: true };
  },
  onActivate: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] Creator Verification Manager activated.`);
    return { success: true };
  },
  onDeactivate: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] Creator Verification Manager deactivated. Verification data preserved.`);
    return { success: true };
  },
  onUpdate: async (ctx: PluginLifecycleContext, fromVersion: string) => {
    console.log(`[Plugin: ${ctx.pluginId}] Updated from v${fromVersion} to v${ctx.version}. Running incremental migrations...`);
    return { success: true };
  },
  onUninstall: async (ctx: PluginLifecycleContext) => {
    console.log(`[Plugin: ${ctx.pluginId}] Creator Verification Manager uninstalled. Warning: Verification tables will be orphaned.`);
    return { success: true };
  }
};

export default pluginConfig;
