import { PluginManifest } from '@/lib/extensions/plugin-types';
import { PipraPayGatewayAdapter } from './services/piprapay-adapter';
import manifest from './manifest.json';

export interface PluginLifecycleContext {
  pluginId: string;
  version: string;
}

/**
 * PipraPay Plugin Configuration & Lifecycle Handlers
 */
export const pluginConfig = {
  manifest: manifest as unknown as PluginManifest,
  adapter: new PipraPayGatewayAdapter(),

  onInstall: async (ctx?: PluginLifecycleContext) => {
    console.log(`[PipraPay Plugin: ${ctx?.pluginId || 'plugin-piprapay'}] onInstall executed.`);
    return { success: true };
  },

  onActivate: async (ctx?: PluginLifecycleContext) => {
    console.log(`[PipraPay Plugin: ${ctx?.pluginId || 'plugin-piprapay'}] onActivate executed. Gateway adapter registered.`);
    return { success: true };
  },

  onDeactivate: async (ctx?: PluginLifecycleContext) => {
    console.log(`[PipraPay Plugin: ${ctx?.pluginId || 'plugin-piprapay'}] onDeactivate executed. Gateway deactivated.`);
    return { success: true };
  },

  onUpdate: async (ctx?: PluginLifecycleContext, fromVersion?: string) => {
    console.log(`[PipraPay Plugin: ${ctx?.pluginId || 'plugin-piprapay'}] onUpdate from ${fromVersion || '1.0.0'} to ${ctx?.version || manifest.version}`);
    return { success: true };
  },

  onUninstall: async (ctx?: PluginLifecycleContext) => {
    console.log(`[PipraPay Plugin: ${ctx?.pluginId || 'plugin-piprapay'}] onUninstall executed.`);
    return { success: true };
  }
};

export default pluginConfig;
