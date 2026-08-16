import { PluginPackageConfig } from '@/lib/loaders/plugin-loader';
import manifest from './manifest.json';

export const pluginConfig: PluginPackageConfig = {
  manifest: manifest as any,
  onInstall: async (ctx) => {
    console.log(`[Plugin: ${ctx?.pluginId || manifest.id}] Creator Analytics & Insights installed successfully.`);
  },
  onActivate: async (ctx) => {
    console.log(`[Plugin: ${ctx?.pluginId || manifest.id}] Creator Analytics & Insights activated.`);
  },
  onDeactivate: async (ctx) => {
    console.log(`[Plugin: ${ctx?.pluginId || manifest.id}] Creator Analytics & Insights deactivated.`);
  },
  onUpdate: async (ctx, fromVersion) => {
    console.log(`[Plugin: ${ctx?.pluginId || manifest.id}] Updated Creator Analytics from v${fromVersion} to v${ctx?.version}`);
  },
  onUninstall: async (ctx) => {
    console.log(`[Plugin: ${ctx?.pluginId || manifest.id}] Uninstalled Creator Analytics & Insights.`);
  }
};

export default pluginConfig;
