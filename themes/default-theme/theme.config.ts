import { ThemeManifest } from '@/lib/extensions/theme-types';
import manifest from './manifest.json';

export const themeConfig: ThemeManifest = manifest as unknown as ThemeManifest;
export default themeConfig;
