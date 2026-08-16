import fs from 'fs';
import path from 'path';

export function generateRegistry() {
  const themesDir = path.join(process.cwd(), 'themes');
  const pluginsDir = path.join(process.cwd(), 'plugins');
  const registryPath = path.join(process.cwd(), 'src/lib/loaders/registry.ts');

  let themeImports = '';
  let themeList = '';
  let pluginImports = '';
  let pluginList = '';

  // 1. Scan Themes
  if (fs.existsSync(themesDir)) {
    const entries = fs.readdirSync(themesDir, { withFileTypes: true });
    entries
      .filter((e) => e.isDirectory())
      .forEach((entry) => {
        const themeSlug = entry.name;
        // Check if config file exists
        const configPath = path.join(themesDir, themeSlug, 'theme.config.ts');
        if (fs.existsSync(configPath)) {
          const varName = themeSlug.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          themeImports += `import ${varName} from '@themes/${themeSlug}/theme.config';\n`;
          themeList += `  ${varName},\n`;
        }
      });
  }

  // 2. Scan Plugins
  if (fs.existsSync(pluginsDir)) {
    const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
    entries
      .filter((e) => e.isDirectory())
      .forEach((entry) => {
        const pluginSlug = entry.name;
        // Check if config file exists
        const configPath = path.join(pluginsDir, pluginSlug, 'plugin.config.ts');
        if (fs.existsSync(configPath)) {
          const varName = pluginSlug.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          pluginImports += `import ${varName} from '@plugins/${pluginSlug}/plugin.config';\n`;
          pluginList += `  ${varName},\n`;
        }
      });
  }

  const content = `import { ThemeManifest } from '@/lib/extensions/theme-types';
import { PluginManifest } from '@/lib/extensions/plugin-types';

// Static discovery imports from root /themes and /plugins directories
${themeImports}
${pluginImports}
/**
 * Discovered themes loaded from root /themes folder
 */
export const DISCOVERED_THEMES: ThemeManifest[] = [
${themeList}];

/**
 * Discovered plugins loaded from root /plugins folder
 */
export const DISCOVERED_PLUGINS = [
${pluginList}];

export const DISCOVERED_PLUGIN_MANIFESTS: PluginManifest[] = DISCOVERED_PLUGINS.map(
  (p) => p.manifest as PluginManifest
);
`;

  // Read current file to compare and prevent unnecessary writes (triggering next.js rebuild loop)
  let currentContent = '';
  if (fs.existsSync(registryPath)) {
    currentContent = fs.readFileSync(registryPath, 'utf-8');
  }

  if (currentContent.trim() !== content.trim()) {
    fs.writeFileSync(registryPath, content, 'utf-8');
    console.log('[Registry Generator] Dynamic registry updated successfully.');
  }
}
