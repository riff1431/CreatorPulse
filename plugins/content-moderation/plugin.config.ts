import manifest from './manifest.json';

export const pluginConfig = {
  manifest,
  onInstall: async () => {
    console.log('[Content Moderation Plugin] Installed');
  },
  onActivate: async () => {
    console.log('[Content Moderation Plugin] Activated');
  },
  onDeactivate: async () => {
    console.log('[Content Moderation Plugin] Deactivated');
  }
};

export default pluginConfig;
