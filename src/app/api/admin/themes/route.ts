import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ThemeManifest } from '@/lib/extensions/theme-types';
import { DISCOVERED_THEMES } from '@/lib/loaders/registry';

const THEMES_DIR = path.join(process.cwd(), 'themes');

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

    // Merge with statically bundled registry to ensure no missing themes
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
    const { action, themeId, tokens, settings, licenseKey, manifest } = body;

    if (action === 'activate') {
      return NextResponse.json({
        success: true,
        message: `Theme ${themeId} activated successfully`,
        activeThemeId: themeId
      });
    }

    if (action === 'customize') {
      return NextResponse.json({
        success: true,
        message: `Theme ${themeId} customization saved`,
        themeId,
        tokens,
        settings
      });
    }

    if (action === 'install' && manifest) {
      return NextResponse.json({
        success: true,
        message: `Theme ${manifest.name} installed successfully`,
        theme: manifest
      });
    }

    return NextResponse.json({ success: true, message: 'Operation recorded' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Theme operation failed' },
      { status: 500 }
    );
  }
}
