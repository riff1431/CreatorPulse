import { ThemeManifest } from '@/lib/extensions/theme-types';
import manifest from './manifest.json';
import { cyberGlowTokens } from './tokens';

export const themeConfig: ThemeManifest = {
  ...(manifest as unknown as ThemeManifest),
  tokens: cyberGlowTokens,
};

export default themeConfig;
