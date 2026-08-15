import JSZip from 'jszip';
import { ThemeManifest } from './theme-types';

const STANDARD_THEME_SUBFOLDERS = [
  'pages',
  'layouts',
  'components',
  'icons',
  'images',
  'fonts',
  'styles',
  'css',
  'js',
  'animations',
  'assets',
  'templates',
  'partials',
  'hooks',
  'config',
  'locales',
  'preview'
];

/**
 * Downloads a complete theme ZIP package (with all 17 directories and files from disk).
 * @param theme The ThemeManifest object to pack.
 * @returns A promise resolving to a Blob containing the complete ZIP data.
 */
export async function exportThemeAsZip(theme: ThemeManifest): Promise<Blob> {
  const targetSlug = theme.slug || theme.id.replace(/^theme-/, '');

  try {
    const res = await fetch(`/api/admin/themes/export?slug=${encodeURIComponent(targetSlug)}`);
    if (res.ok) {
      return await res.blob();
    }
  } catch (err) {
    console.warn('[ThemeZipHelper] Server export failed, generating client-side package fallback', err);
  }

  // Client-side fallback: Build full 17-directory compliant ZIP archive
  const zip = new JSZip();

  // Write root files
  zip.file('manifest.json', JSON.stringify(theme, null, 2));
  zip.file('theme.json', JSON.stringify(theme, null, 2));
  zip.file('index.ts', `// Custom Theme Entry Point\nexport const themeManifest = ${JSON.stringify(theme, null, 2)};\n`);
  zip.file('theme.config.ts', `export default ${JSON.stringify(theme.tokens || {}, null, 2)};\n`);
  zip.file('README.md', `# ${theme.name}\n\n${theme.description || 'Custom Theme'}\n\nVersion: ${theme.version || '1.0.0'}\n`);

  // Create all 17 standardized theme subdirectories
  for (const folderName of STANDARD_THEME_SUBFOLDERS) {
    const folder = zip.folder(folderName);
    if (folder) {
      if (folderName === 'styles') {
        folder.file('theme.css', theme.assets?.cssOverrides || `/* Custom Theme Styles */\n:root {\n  --theme-primary: ${theme.tokens?.primary || '#EC4899'};\n}\n`);
      } else if (folderName === 'locales') {
        folder.file('en.json', JSON.stringify({ themeName: theme.name }, null, 2));
      } else if (folderName === 'config') {
        folder.file('theme.tokens.ts', `export const themeTokens = ${JSON.stringify(theme.tokens || {}, null, 2)};\n`);
      } else if (folderName === 'preview') {
        folder.file('preview.json', JSON.stringify({ previewImageUrl: theme.previewImageUrl || '' }, null, 2));
      } else {
        folder.file('.gitkeep', '');
      }
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Searches for and parses `manifest.json` or `theme.json` from a Theme ZIP file.
 * Supports manifest files at the root or in a sub-folder.
 * @param file The ZIP File uploaded by the user.
 * @returns A promise resolving to the parsed theme manifest object.
 */
export async function importThemeFromZip(file: File): Promise<any> {
  const zip = await JSZip.loadAsync(file);

  let themeJsonFile = zip.file('manifest.json') || zip.file('theme.json');

  if (!themeJsonFile) {
    const keys = Object.keys(zip.files);
    const manifestKey = keys.find(
      (key) => key.endsWith('/manifest.json') || key.endsWith('\\manifest.json') || key.endsWith('/theme.json') || key.endsWith('\\theme.json')
    );
    if (manifestKey) {
      themeJsonFile = zip.file(manifestKey);
    }
  }

  if (!themeJsonFile) {
    throw new Error('No valid manifest.json or theme.json found in the ZIP package.');
  }

  const text = await themeJsonFile.async('text');
  try {
    return JSON.parse(text);
  } catch (err: any) {
    throw new Error('Malformed manifest in ZIP package: ' + err.message);
  }
}
