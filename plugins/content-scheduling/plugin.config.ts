import { PluginPackageConfig } from '@/lib/loaders/plugin-loader';
import manifest from './manifest.json';

export const pluginConfig: PluginPackageConfig = {
  manifest: manifest as any,
  onInstall: async (ctx) => {
    console.log(`[Plugin: ${ctx?.pluginId || manifest.id}] Content Scheduling & Auto-Publishing installed successfully.`);
  },
  onActivate: async (ctx) => {
    console.log(`[Plugin: ${ctx?.pluginId || manifest.id}] Content Scheduling & Auto-Publishing activated.`);
  },
  onDeactivate: async (ctx) => {
    console.log(`[Plugin: ${ctx?.pluginId || manifest.id}] Content Scheduling & Auto-Publishing deactivated.`);
  },
  onUpdate: async (ctx, fromVersion) => {
    console.log(`[Plugin: ${ctx?.pluginId || manifest.id}] Updated Content Scheduling from v${fromVersion} to v${ctx?.version}`);
  },
  onUninstall: async (ctx) => {
    console.log(`[Plugin: ${ctx?.pluginId || manifest.id}] Uninstalled Content Scheduling & Auto-Publishing.`);
  }
};

export default pluginConfig;
