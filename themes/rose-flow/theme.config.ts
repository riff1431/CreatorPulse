import { ThemeManifest } from '@/lib/extensions/theme-types';
import manifest from './manifest.json';
import { roseFlowTokens } from './tokens';

export const themeConfig: ThemeManifest = {
  ...(manifest as unknown as ThemeManifest),
  tokens: roseFlowTokens,
};

export default themeConfig;
