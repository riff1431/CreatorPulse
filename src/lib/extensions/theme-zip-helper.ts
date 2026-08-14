import JSZip from 'jszip';
import { ThemeManifest } from './theme-types';

/**
 * Packs a theme manifest object into a ZIP file with `theme.json` at the root.
 * @param theme The ThemeManifest object to pack.
 * @returns A promise resolving to a Blob containing the ZIP data.
 */
export async function exportThemeAsZip(theme: ThemeManifest): Promise<Blob> {
  const zip = new JSZip();
  const themeJson = JSON.stringify(theme, null, 2);
  zip.file('theme.json', themeJson);
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Searches for and parses `theme.json` from a Theme ZIP file.
 * Supports theme.json at the root or in a sub-folder.
 * @param file The ZIP File uploaded by the user.
 * @returns A promise resolving to the parsed theme manifest object.
 */
export async function importThemeFromZip(file: File): Promise<any> {
  const zip = await JSZip.loadAsync(file);
  
  // Find a file named theme.json (either at root or inside a folder)
  let themeJsonFile: JSZip.JSZipObject | null = null;
  
  // Look for exact match 'theme.json' first
  themeJsonFile = zip.file('theme.json');
  
  // If not found, search the folders
  if (!themeJsonFile) {
    const keys = Object.keys(zip.files);
    const manifestKey = keys.find(key => key.endsWith('/theme.json') || key.endsWith('\\theme.json'));
    if (manifestKey) {
      themeJsonFile = zip.file(manifestKey);
    }
  }

  if (!themeJsonFile) {
    throw new Error('No valid theme.json manifest found in the ZIP package.');
  }

  const text = await themeJsonFile.async('text');
  try {
    return JSON.parse(text);
  } catch (err: any) {
    throw new Error('Malformed theme.json manifest in ZIP package: ' + err.message);
  }
}
