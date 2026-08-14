import { ThemeManifest } from '@/lib/extensions/theme-types';
import { PluginManifest } from '@/lib/extensions/plugin-types';

// Static discovery imports from root /themes and /plugins directories
import blushCore from '@themes/blush-core/theme.config';
import roseFlow from '@themes/rose-flow/theme.config';
import cyberGlow from '@themes/cyber-glow/theme.config';
import frostedGlass from '@themes/frosted-glass/theme.config';
import starterTheme from '@themes/starter-theme/theme.config';

import drmWatermark from '@plugins/drm-watermark/plugin.config';
import virtualGifts from '@plugins/virtual-gifts/plugin.config';
import creatorStories from '@plugins/creator-stories/plugin.config';
import telegramSync from '@plugins/telegram-sync/plugin.config';
import seoSocial from '@plugins/seo-social/plugin.config';
import starterPlugin from '@plugins/starter-plugin/plugin.config';

/**
 * Discovered themes loaded from root /themes folder
 */
export const DISCOVERED_THEMES: ThemeManifest[] = [
  blushCore,
  roseFlow,
  cyberGlow,
  frostedGlass,
  starterTheme,
];

/**
 * Discovered plugins loaded from root /plugins folder
 */
export const DISCOVERED_PLUGINS = [
  drmWatermark,
  virtualGifts,
  creatorStories,
  telegramSync,
  seoSocial,
  starterPlugin,
];

export const DISCOVERED_PLUGIN_MANIFESTS: PluginManifest[] = DISCOVERED_PLUGINS.map(
  (p) => p.manifest
);
