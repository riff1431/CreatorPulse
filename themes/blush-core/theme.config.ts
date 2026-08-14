import { ThemeManifest } from '@/lib/extensions/theme-types';
import manifest from './manifest.json';
import { blushCoreTokens } from './tokens';

export const themeConfig: ThemeManifest = {
  ...(manifest as unknown as ThemeManifest),
  tokens: blushCoreTokens,
};

export default themeConfig;
