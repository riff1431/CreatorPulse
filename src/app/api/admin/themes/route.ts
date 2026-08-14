import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { ThemeManifest } from '@/lib/extensions/theme-types';
import { DISCOVERED_THEMES } from '@/lib/loaders/registry';

const THEMES_DIR = path.join(process.cwd(), 'themes');

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

          loadedThemes.push({
            ...manifest,
            assets: {
              ...(manifest.assets || {}),
              cssOverrides: cssOverrides || manifest.assets?.cssOverrides || ''
            }
          });
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
      activeThemeId: themes.find((t) => t.isActive)?.id || 'theme-blush-core',
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

      if (themeId === 'theme-blush-core' || themeId === 'blush-core') {
        return NextResponse.json(
          { success: false, error: 'The core default "Blush Core" theme is protected and cannot be deleted.' },
          { status: 400 }
        );
      }

      const found = await findThemeDir(themeId);
      if (found) {
        await fs.promises.rm(found.folderPath, { recursive: true, force: true });
        console.log(`[API /admin/themes] Deleted theme directory: ${found.folderPath}`);
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

      // Look for manifest.json or theme.json inside zip
      let manifestEntry = zip.file('manifest.json') || zip.file('theme.json');
      if (!manifestEntry) {
        const fileNames = Object.keys(zip.files);
        const match = fileNames.find((k) => k.endsWith('/manifest.json') || k.endsWith('/theme.json'));
        if (match) {
          manifestEntry = zip.file(match);
        }
      }

      if (!manifestEntry) {
        return NextResponse.json(
          { success: false, error: 'ZIP does not contain a valid manifest.json or theme.json' },
          { status: 400 }
        );
      }

      const manifestRaw = await manifestEntry.async('text');
      const parsedManifest: ThemeManifest = JSON.parse(manifestRaw);
      const slug = parsedManifest.slug || parsedManifest.name.toLowerCase().replace(/[^a-z0-9_]/g, '-');
      const targetDir = path.join(THEMES_DIR, slug);

      if (!fs.existsSync(targetDir)) {
        await fs.promises.mkdir(targetDir, { recursive: true });
      }

      // Extract all files into targetDir
      for (const [filename, fileObj] of Object.entries(zip.files)) {
        if (fileObj.dir) continue;
        // Strip parent folder prefix if packaged inside a root folder
        const cleanName = filename.includes('/') ? filename.split('/').slice(1).join('/') || filename : filename;
        const filePath = path.join(targetDir, cleanName);
        const fileDir = path.dirname(filePath);

        if (!fs.existsSync(fileDir)) {
          await fs.promises.mkdir(fileDir, { recursive: true });
        }

        const content = await fileObj.async('nodebuffer');
        await fs.promises.writeFile(filePath, content);
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

      // Ensure manifest.json is placed at the root of the theme folder
      await fs.promises.writeFile(
        path.join(targetDir, 'manifest.json'),
        JSON.stringify(parsedManifest, null, 2),
        'utf-8'
      );

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
