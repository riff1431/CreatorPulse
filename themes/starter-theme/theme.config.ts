import { ThemeManifest } from '@/lib/extensions/theme-types';
import manifest from './manifest.json';
import { starterThemeTokens } from './tokens';

export const themeConfig: ThemeManifest = {
  ...(manifest as unknown as ThemeManifest),
  tokens: starterThemeTokens,
};

export default themeConfig;
