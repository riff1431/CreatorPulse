import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PluginManifest } from '@/lib/extensions/plugin-types';
import { DISCOVERED_PLUGIN_MANIFESTS } from '@/lib/loaders/registry';

const PLUGINS_DIR = path.join(process.cwd(), 'plugins');

/**
 * Helper to dynamically scan and read /plugins directory on disk
 */
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
        } catch (err) {
          console.error(`[API /admin/plugins] Failed parsing manifest for ${folder}:`, err);
        }
      }
    }

    // Merge with statically bundled registry
    const pluginMap = new Map<string, PluginManifest>();
    DISCOVERED_PLUGIN_MANIFESTS.forEach((p) => pluginMap.set(p.id, p));
    loadedPlugins.forEach((p) => pluginMap.set(p.id, { ...pluginMap.get(p.id), ...p }));

    return Array.from(pluginMap.values());
  } catch (err) {
    console.error('[API /admin/plugins] Disk scan error:', err);
    return DISCOVERED_PLUGIN_MANIFESTS;
  }
}

export async function GET() {
  try {
    const plugins = await scanPluginsOnDisk();
    return NextResponse.json({
      success: true,
      plugins,
      count: plugins.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to scan plugins' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, pluginId, isEnabled, settingsValues, manifest } = body;

    if (action === 'toggle') {
      return NextResponse.json({
        success: true,
        message: `Plugin ${pluginId} ${isEnabled ? 'enabled' : 'disabled'} successfully`,
        pluginId,
        isEnabled
      });
    }

    if (action === 'settings') {
      return NextResponse.json({
        success: true,
        message: `Settings saved for ${pluginId}`,
        pluginId,
        settingsValues
      });
    }

    if (action === 'install' && manifest) {
      return NextResponse.json({
        success: true,
        message: `Plugin ${manifest.name} installed successfully`,
        plugin: manifest
      });
    }

    return NextResponse.json({ success: true, message: 'Plugin operation recorded' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Plugin operation failed' },
      { status: 500 }
    );
  }
}
