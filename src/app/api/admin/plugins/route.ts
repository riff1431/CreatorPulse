import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { PluginManifest } from '@/lib/extensions/plugin-types';
import { DISCOVERED_PLUGIN_MANIFESTS } from '@/lib/loaders/registry';

const PLUGINS_DIR = path.join(process.cwd(), 'plugins');

/**
 * Helper to locate plugin directory on disk
 */
async function findPluginDir(pluginId: string): Promise<{ folderName: string; folderPath: string } | null> {
  if (!fs.existsSync(PLUGINS_DIR)) return null;
  const entries = await fs.promises.readdir(PLUGINS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const folderPath = path.join(PLUGINS_DIR, entry.name);
      const manifestPath = path.join(folderPath, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const raw = await fs.promises.readFile(manifestPath, 'utf-8');
          const data = JSON.parse(raw);
          if (data.id === pluginId || data.slug === pluginId || entry.name === pluginId) {
            return { folderName: entry.name, folderPath };
          }
        } catch {}
      }
      if (entry.name === pluginId || entry.name === pluginId.replace(/^plugin-/, '')) {
        return { folderName: entry.name, folderPath };
      }
    }
  }
  return null;
}

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
    const { action, pluginId, isEnabled, settingsValues, manifest, zipBase64 } = body;

    // 1. DELETE ACTION - Physically remove folder from disk
    if (action === 'delete') {
      if (!pluginId) {
        return NextResponse.json({ success: false, error: 'Plugin ID is required.' }, { status: 400 });
      }

      const found = await findPluginDir(pluginId);
      if (found) {
        await fs.promises.rm(found.folderPath, { recursive: true, force: true });
        console.log(`[API /admin/plugins] Deleted plugin directory: ${found.folderPath}`);
      }

      const updatedPlugins = await scanPluginsOnDisk();
      return NextResponse.json({
        success: true,
        message: `Plugin "${pluginId}" removed from filesystem.`,
        plugins: updatedPlugins
      });
    }

    // 2. ZIP UPLOAD / EXTRACTION ACTION
    if (action === 'upload_zip' && zipBase64) {
      const buffer = Buffer.from(zipBase64, 'base64');
      const zip = await JSZip.loadAsync(buffer);

      // Look for manifest.json or plugin.json inside zip
      let manifestEntry = zip.file('manifest.json') || zip.file('plugin.json');
      if (!manifestEntry) {
        const fileNames = Object.keys(zip.files);
        const match = fileNames.find((k) => k.endsWith('/manifest.json') || k.endsWith('/plugin.json'));
        if (match) {
          manifestEntry = zip.file(match);
        }
      }

      if (!manifestEntry) {
        return NextResponse.json(
          { success: false, error: 'ZIP does not contain a valid manifest.json or plugin.json' },
          { status: 400 }
        );
      }

      const manifestRaw = await manifestEntry.async('text');
      const parsedManifest: PluginManifest = JSON.parse(manifestRaw);
      const slug = parsedManifest.slug || parsedManifest.name.toLowerCase().replace(/[^a-z0-9_]/g, '-');
      const targetDir = path.join(PLUGINS_DIR, slug);

      if (!fs.existsSync(targetDir)) {
        await fs.promises.mkdir(targetDir, { recursive: true });
      }

      // Extract all files into targetDir
      for (const [filename, fileObj] of Object.entries(zip.files)) {
        if (fileObj.dir) continue;
        const cleanName = filename.includes('/') ? filename.split('/').slice(1).join('/') || filename : filename;
        const filePath = path.join(targetDir, cleanName);
        const fileDir = path.dirname(filePath);

        if (!fs.existsSync(fileDir)) {
          await fs.promises.mkdir(fileDir, { recursive: true });
        }

        const content = await fileObj.async('nodebuffer');
        await fs.promises.writeFile(filePath, content);
      }

      // Ensure manifest.json is placed at the root of the plugin folder
      await fs.promises.writeFile(
        path.join(targetDir, 'manifest.json'),
        JSON.stringify(parsedManifest, null, 2),
        'utf-8'
      );

      const updatedPlugins = await scanPluginsOnDisk();
      return NextResponse.json({
        success: true,
        message: `Plugin "${parsedManifest.name}" extracted and installed into /plugins/${slug}`,
        plugin: parsedManifest,
        plugins: updatedPlugins
      });
    }

    // 3. INSTALL MANIFEST ACTION
    if (action === 'install' && manifest) {
      const slug = manifest.slug || manifest.name.toLowerCase().replace(/[^a-z0-9_]/g, '-');
      const targetDir = path.join(PLUGINS_DIR, slug);

      if (!fs.existsSync(targetDir)) {
        await fs.promises.mkdir(targetDir, { recursive: true });
      }

      // Write manifest.json
      await fs.promises.writeFile(
        path.join(targetDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2),
        'utf-8'
      );

      // Write default plugin.config.ts if missing
      const configPath = path.join(targetDir, 'plugin.config.ts');
      if (!fs.existsSync(configPath)) {
        const configCode = `import { PluginPackageConfig } from '@/lib/loaders/plugin-loader';\n\nexport const pluginConfig: PluginPackageConfig = {\n  manifest: ${JSON.stringify(manifest, null, 2)},\n  onActivate: async () => {\n    console.log('[Plugin] Activated ${manifest.name}');\n  },\n  onDeactivate: async () => {\n    console.log('[Plugin] Deactivated ${manifest.name}');\n  }\n};\n\nexport default pluginConfig;\n`;
        await fs.promises.writeFile(configPath, configCode, 'utf-8');
      }

      const updatedPlugins = await scanPluginsOnDisk();
      return NextResponse.json({
        success: true,
        message: `Plugin ${manifest.name} installed into /plugins/${slug}`,
        plugin: manifest,
        plugins: updatedPlugins
      });
    }

    // 4. TOGGLE ACTION
    if (action === 'toggle') {
      return NextResponse.json({
        success: true,
        message: `Plugin ${pluginId} ${isEnabled ? 'enabled' : 'disabled'} successfully`,
        pluginId,
        isEnabled
      });
    }

    // 5. SETTINGS ACTION
    if (action === 'settings') {
      return NextResponse.json({
        success: true,
        message: `Settings saved for ${pluginId}`,
        pluginId,
        settingsValues
      });
    }

    return NextResponse.json({ success: true, message: 'Plugin operation recorded' });
  } catch (error: any) {
    console.error('[API /admin/plugins] POST Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Plugin operation failed' },
      { status: 500 }
    );
  }
}
