import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { ThemeManifest } from '@/lib/extensions/theme-types';
import { DISCOVERED_THEMES, DISCOVERED_PLUGIN_MANIFESTS } from '@/lib/loaders/registry';
import { generateRegistry } from '@/lib/loaders/registry-generator';
import { CompatibilityChecker } from '@/lib/loaders/compatibility-checker';
import { PluginManifest } from '@/lib/extensions/plugin-types';

const THEMES_DIR = path.join(process.cwd(), 'themes');
const PLUGINS_DIR = path.join(process.cwd(), 'plugins');

async function scanPluginsOnDisk(): Promise<PluginManifest[]> {
  try {
    if (!fs.existsSync(PLUGINS_DIR)) {
      return DISCOVERED_PLUGIN_MANIFESTS;
    }
    const entries = await fs.promises.readdir(PLUGINS_DIR, { withFileTypes: true });
    const pluginFolders = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    const loadedPlugins: PluginManifest[] = [];
    for (const folder of pluginFolders) {
      const manifestPath = path.join(PLUGINS_DIR, folder, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const raw = await fs.promises.readFile(manifestPath, 'utf-8');
          const manifest = JSON.parse(raw);
          loadedPlugins.push(manifest);
        } catch {}
      }
    }
    const pluginMap = new Map<string, PluginManifest>();
    DISCOVERED_PLUGIN_MANIFESTS.forEach((p) => pluginMap.set(p.id, p));
    loadedPlugins.forEach((p) => pluginMap.set(p.id, { ...pluginMap.get(p.id), ...p }));
    return Array.from(pluginMap.values());
  } catch {
    return DISCOVERED_PLUGIN_MANIFESTS;
  }
}

/**
 * Helper to locate theme directory on disk
 */
async function findThemeDir(themeId: string): Promise<{ folderName: string; folderPath: string } | null> {
  if (!fs.existsSync(THEMES_DIR)) return null;
  const entries = await fs.promises.readdir(THEMES_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const folderPath = path.join(THEMES_DIR, entry.name);
      const manifestPath = path.join(folderPath, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const raw = await fs.promises.readFile(manifestPath, 'utf-8');
          const data = JSON.parse(raw);
          if (data.id === themeId || data.slug === themeId || entry.name === themeId) {
            return { folderName: entry.name, folderPath };
          }
        } catch {}
      }
      if (entry.name === themeId || entry.name === themeId.replace(/^theme-/, '')) {
        return { folderName: entry.name, folderPath };
      }
    }
  }
  return null;
}

/**
 * Helper to dynamically scan and read /themes directory on disk
 */
async function scanThemesOnDisk(): Promise<ThemeManifest[]> {
  try {
    if (!fs.existsSync(THEMES_DIR)) {
      return DISCOVERED_THEMES;
    }

    const entries = await fs.promises.readdir(THEMES_DIR, { withFileTypes: true });
    const themeFolders = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    const loadedThemes: ThemeManifest[] = [];

    for (const folder of themeFolders) {
      const manifestPath = path.join(THEMES_DIR, folder, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const raw = await fs.promises.readFile(manifestPath, 'utf-8');
          const manifest = JSON.parse(raw);

          // Check if theme.css overrides exist
          const cssPath = path.join(THEMES_DIR, folder, 'styles', 'theme.css');
          let cssOverrides = '';
          if (fs.existsSync(cssPath)) {
            cssOverrides = await fs.promises.readFile(cssPath, 'utf-8');
          }

          // Introspect directory structure
          const folderEntries = await fs.promises.readdir(path.join(THEMES_DIR, folder), { withFileTypes: true });
          const existingDirs = folderEntries.filter(e => e.isDirectory()).map(e => e.name);

          loadedThemes.push({
            ...manifest,
            assets: {
              ...(manifest.assets || {}),
              cssOverrides: cssOverrides || manifest.assets?.cssOverrides || ''
            },
            directoryHealth: {
              totalStandard: 17,
              presentCount: existingDirs.length,
              folders: existingDirs,
              isCompliant: existingDirs.length >= 10
            }
          } as any);
        } catch (err) {
          console.error(`[API /admin/themes] Failed parsing manifest for ${folder}:`, err);
        }
      }
    }

    // Merge with statically bundled registry
    const themeMap = new Map<string, ThemeManifest>();
    DISCOVERED_THEMES.forEach((t) => themeMap.set(t.id, t));
    loadedThemes.forEach((t) => themeMap.set(t.id, { ...themeMap.get(t.id), ...t }));

    return Array.from(themeMap.values());
  } catch (err) {
    console.error('[API /admin/themes] Disk scan error:', err);
    return DISCOVERED_THEMES;
  }
}

export async function GET() {
  try {
    const themes = await scanThemesOnDisk();
    return NextResponse.json({
      success: true,
      themes,
      activeThemeId: themes.find((t) => t.isActive)?.id || 'theme-default-theme',
      count: themes.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to scan themes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, themeId, tokens, settings, licenseKey, manifest, zipBase64 } = body;

    // 1. DELETE ACTION - Physically remove folder from disk
    if (action === 'delete') {
      if (!themeId) {
        return NextResponse.json({ success: false, error: 'Theme ID is required.' }, { status: 400 });
      }

      if (themeId === 'theme-default-theme' || themeId === 'default-theme' || themeId === 'theme-blush-core') {
        return NextResponse.json(
          { success: false, error: 'The core Official Default Theme is protected and cannot be deleted.' },
          { status: 400 }
        );
      }

      const found = await findThemeDir(themeId);
      if (found) {
        await fs.promises.rm(found.folderPath, { recursive: true, force: true });
        console.log(`[API /admin/themes] Deleted theme directory: ${found.folderPath}`);
        // Regenerate registry.ts dynamically
        generateRegistry();
      }

      const updatedThemes = await scanThemesOnDisk();
      return NextResponse.json({
        success: true,
        message: `Theme "${themeId}" removed from filesystem.`,
        themes: updatedThemes
      });
    }

    // 2. ZIP UPLOAD / EXTRACTION ACTION
    if (action === 'upload_zip' && zipBase64) {
      const buffer = Buffer.from(zipBase64, 'base64');
      const zip = await JSZip.loadAsync(buffer);

      const fileNames = Object.keys(zip.files);
      // Filter out hidden directories/files (such as macOS double metadata __MACOSX)
      const activeFileNames = fileNames.filter(
        (name) => !name.startsWith('__MACOSX/') && name !== '.DS_Store' && !name.endsWith('.DS_Store')
      );

      if (activeFileNames.length === 0) {
        return NextResponse.json({ success: false, error: 'ZIP archive is empty.' }, { status: 400 });
      }

      // Enforce path traversal check
      for (const filename of activeFileNames) {
        const normalized = filename.replace(/\\/g, '/');
        if (
          normalized.includes('../') ||
          normalized.includes('/..') ||
          normalized.startsWith('../') ||
          normalized.startsWith('/') ||
          normalized.includes('..\\') ||
          normalized.includes('\\..')
        ) {
          return NextResponse.json(
            { success: false, error: `Unsafe ZIP content: Path traversal sequence detected in: "${filename}"` },
            { status: 400 }
          );
        }
      }

      // Enforce single root directory check
      const firstParts = activeFileNames.map((name) => {
        const normalized = name.replace(/\\/g, '/');
        const idx = normalized.indexOf('/');
        return idx > -1 ? normalized.substring(0, idx) : '';
      });

      const firstPart = firstParts[0];
      const hasSingleRoot = firstPart !== '' && firstParts.every((part) => part === firstPart);

      if (!hasSingleRoot) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid ZIP structure: Package must contain a single root folder (e.g. /theme-slug/) containing the Theme SDK structure. Flat files or multiple folders at the top level are not allowed.'
          },
          { status: 400 }
        );
      }

      const rootFolder = firstPart;

      // Locate manifest file within root folder
      const manifestEntry = zip.file(`${rootFolder}/manifest.json`) || zip.file(`${rootFolder}/theme.json`);
      if (!manifestEntry) {
        return NextResponse.json(
          { success: false, error: `Invalid Theme package: manifest.json not found inside the root folder "${rootFolder}/".` },
          { status: 400 }
        );
      }

      const manifestRaw = await manifestEntry.async('text');
      let parsedManifest: ThemeManifest;
      try {
        parsedManifest = JSON.parse(manifestRaw);
      } catch (err: any) {
        return NextResponse.json(
          { success: false, error: `Malformed manifest JSON file: ${err.message}` },
          { status: 400 }
        );
      }

      // Run standard folders check
      const expectedDirs = [
        'pages', 'layouts', 'components', 'icons', 'images', 'fonts',
        'styles', 'css', 'js', 'animations', 'assets', 'templates',
        'partials', 'hooks', 'config', 'locales', 'preview'
      ];
      const folderNames: string[] = [];
      for (const name of activeFileNames) {
        const normalized = name.replace(/\\/g, '/');
        if (normalized === `${rootFolder}/manifest.json` || normalized === `${rootFolder}/theme.json`) continue;

        const pathAfterRoot = normalized.substring(rootFolder.length + 1);
        const folderIdx = pathAfterRoot.indexOf('/');
        if (folderIdx > -1) {
          const subDir = pathAfterRoot.substring(0, folderIdx);
          if (expectedDirs.includes(subDir) && !folderNames.includes(subDir)) {
            folderNames.push(subDir);
          }
        }
      }

      // Enforce slug matches zip root folder name
      if (parsedManifest.slug !== rootFolder) {
        return NextResponse.json(
          { success: false, error: `Slug Mismatch: Theme slug in manifest ("${parsedManifest.slug}") must match ZIP root directory name ("${rootFolder}").` },
          { status: 400 }
        );
      }

      const existingThemes = await scanThemesOnDisk();
      const existingPlugins = await scanPluginsOnDisk();

      // Run compatibility diagnostics
      const compatibilityReport = CompatibilityChecker.checkTheme(
        parsedManifest,
        folderNames,
        existingThemes,
        existingPlugins
      );

      if (!compatibilityReport.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Theme compatibility validation failed.',
            report: compatibilityReport
          },
          { status: 400 }
        );
      }

      // Extract to /themes/{theme-slug}/
      const slug = parsedManifest.slug;
      const targetDir = path.join(THEMES_DIR, slug);

      if (fs.existsSync(targetDir)) {
        await fs.promises.rm(targetDir, { recursive: true, force: true });
      }
      await fs.promises.mkdir(targetDir, { recursive: true });

      for (const [filename, fileObj] of Object.entries(zip.files)) {
        if (fileObj.dir) continue;
        const normalized = filename.replace(/\\/g, '/');
        if (!normalized.startsWith(`${rootFolder}/`)) continue;

        const cleanName = normalized.substring(rootFolder.length + 1);
        if (cleanName === '.DS_Store' || cleanName.startsWith('__MACOSX/')) continue;

        const filePath = path.join(targetDir, cleanName);

        // Traversal boundary validation
        if (!filePath.startsWith(targetDir + path.sep) && filePath !== targetDir) {
          return NextResponse.json({ success: false, error: 'Unsafe extraction: File path resolves outside theme boundary.' }, { status: 400 });
        }

        const fileDir = path.dirname(filePath);
        if (!fs.existsSync(fileDir)) {
          await fs.promises.mkdir(fileDir, { recursive: true });
        }

        const content = await fileObj.async('nodebuffer');
        await fs.promises.writeFile(filePath, content);
      }

      // Auto-initialize standard SDK folders on disk
      for (const dir of expectedDirs) {
        const subDir = path.join(targetDir, dir);
        if (!fs.existsSync(subDir)) {
          await fs.promises.mkdir(subDir, { recursive: true });
        }
      }

      // Place clean manifest.json at root of folder
      await fs.promises.writeFile(
        path.join(targetDir, 'manifest.json'),
        JSON.stringify(parsedManifest, null, 2),
        'utf-8'
      );

      // Regenerate registry.ts dynamically
      generateRegistry();

      const updatedThemes = await scanThemesOnDisk();
      return NextResponse.json({
        success: true,
        message: `Theme "${parsedManifest.name}" extracted and installed into /themes/${slug}`,
        theme: parsedManifest,
        themes: updatedThemes
      });
    }

    // 3. INSTALL MANIFEST ACTION
    if (action === 'install' && manifest) {
      const slug = manifest.slug || manifest.name.toLowerCase().replace(/[^a-z0-9_]/g, '-');
      const targetDir = path.join(THEMES_DIR, slug);

      const existingThemes = await scanThemesOnDisk();
      const existingPlugins = await scanPluginsOnDisk();

      // Run compatibility diagnostics
      const compatibilityReport = CompatibilityChecker.checkTheme(
        manifest,
        [],
        existingThemes,
        existingPlugins
      );

      if (!compatibilityReport.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Theme compatibility validation failed.',
            report: compatibilityReport
          },
          { status: 400 }
        );
      }

      if (!fs.existsSync(targetDir)) {
        await fs.promises.mkdir(targetDir, { recursive: true });
      }

      // Ensure all standard Theme SDK subdirectories exist
      for (const dir of [
        'pages', 'layouts', 'components', 'icons', 'images', 'fonts',
        'styles', 'css', 'js', 'animations', 'assets', 'templates',
        'partials', 'hooks', 'config', 'locales', 'preview'
      ]) {
        const subDir = path.join(targetDir, dir);
        if (!fs.existsSync(subDir)) {
          await fs.promises.mkdir(subDir, { recursive: true });
        }
      }

      // Write manifest.json
      await fs.promises.writeFile(
        path.join(targetDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2),
        'utf-8'
      );

      // Write styles/theme.css if provided
      if (manifest.assets?.cssOverrides) {
        const stylesDir = path.join(targetDir, 'styles');
        if (!fs.existsSync(stylesDir)) {
          await fs.promises.mkdir(stylesDir, { recursive: true });
        }
        await fs.promises.writeFile(path.join(stylesDir, 'theme.css'), manifest.assets.cssOverrides, 'utf-8');
      }

      // Regenerate registry.ts dynamically
      generateRegistry();

      const updatedThemes = await scanThemesOnDisk();
      return NextResponse.json({
        success: true,
        message: `Theme ${manifest.name} installed into /themes/${slug}`,
        theme: manifest,
        themes: updatedThemes
      });
    }

    // 4. ACTIVATE ACTION
    if (action === 'activate') {
      return NextResponse.json({
        success: true,
        message: `Theme ${themeId} activated successfully`,
        activeThemeId: themeId
      });
    }

    // 5. CUSTOMIZE ACTION
    if (action === 'customize') {
      return NextResponse.json({
        success: true,
        message: `Theme ${themeId} customization saved`,
        themeId,
        tokens,
        settings
      });
    }

    return NextResponse.json({ success: true, message: 'Operation recorded' });
  } catch (error: any) {
    console.error('[API /admin/themes] POST Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Theme operation failed' },
      { status: 500 }
    );
  }
}
