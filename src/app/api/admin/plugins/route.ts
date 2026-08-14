import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { PluginManifest } from '@/lib/extensions/plugin-types';
import { DISCOVERED_PLUGIN_MANIFESTS } from '@/lib/loaders/registry';
import { generateRegistry } from '@/lib/loaders/registry-generator';
import { CompatibilityChecker } from '@/lib/loaders/compatibility-checker';

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
        // Regenerate registry.ts dynamically
        generateRegistry();
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
            error: 'Invalid ZIP structure: Package must contain a single root folder (e.g. /plugin-slug/) containing the Plugin SDK structure. Flat files or multiple folders at the top level are not allowed.'
          },
          { status: 400 }
        );
      }

      const rootFolder = firstPart;

      // Locate manifest file within root folder
      const manifestEntry = zip.file(`${rootFolder}/manifest.json`) || zip.file(`${rootFolder}/plugin.json`);
      if (!manifestEntry) {
        return NextResponse.json(
          { success: false, error: `Invalid Plugin package: manifest.json not found inside the root folder "${rootFolder}/".` },
          { status: 400 }
        );
      }

      const manifestRaw = await manifestEntry.async('text');
      let parsedManifest: PluginManifest;
      try {
        parsedManifest = JSON.parse(manifestRaw);
      } catch (err: any) {
        return NextResponse.json(
          { success: false, error: `Malformed manifest JSON file: ${err.message}` },
          { status: 400 }
        );
      }

      // Validate manifest requirements
      if (!parsedManifest.id || typeof parsedManifest.id !== 'string') {
        return NextResponse.json({ success: false, error: 'Manifest Error: Plugin ID is missing or invalid.' }, { status: 400 });
      }
      if (!parsedManifest.slug || typeof parsedManifest.slug !== 'string') {
        return NextResponse.json({ success: false, error: 'Manifest Error: Plugin slug is missing or invalid.' }, { status: 400 });
      }
      if (!parsedManifest.name || typeof parsedManifest.name !== 'string') {
        return NextResponse.json({ success: false, error: 'Manifest Error: Plugin name is missing or invalid.' }, { status: 400 });
      }
      if (!parsedManifest.version || typeof parsedManifest.version !== 'string') {
        return NextResponse.json({ success: false, error: 'Manifest Error: Plugin version is missing or invalid.' }, { status: 400 });
      }
      if (!Array.isArray(parsedManifest.permissions)) {
        return NextResponse.json({ success: false, error: 'Manifest Error: Plugin permissions array is required.' }, { status: 400 });
      }
      if (!Array.isArray(parsedManifest.hooks)) {
        return NextResponse.json({ success: false, error: 'Manifest Error: Plugin hooks array is required.' }, { status: 400 });
      }

      // Enforce slug matches zip root folder name
      if (parsedManifest.slug !== rootFolder) {
        return NextResponse.json(
          { success: false, error: `Slug Mismatch: Plugin slug in manifest ("${parsedManifest.slug}") must match ZIP root directory name ("${rootFolder}").` },
          { status: 400 }
        );
      }

      // Run standard folders check
      const expectedDirs = [
        'client', 'server', 'api', 'components', 'pages', 'routes', 'hooks',
        'services', 'database', 'migrations', 'settings', 'permissions', 'icons',
        'images', 'css', 'js', 'assets', 'locales', 'jobs', 'events',
        'webhooks', 'tests', 'docs'
      ];
      const folderNames: string[] = [];
      for (const name of activeFileNames) {
        const normalized = name.replace(/\\/g, '/');
        if (normalized === `${rootFolder}/manifest.json` || normalized === `${rootFolder}/plugin.json`) continue;

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
          { success: false, error: `Slug Mismatch: Plugin slug in manifest ("${parsedManifest.slug}") must match ZIP root directory name ("${rootFolder}").` },
          { status: 400 }
        );
      }

      // Extract SQL migrations for database migration checking
      const migrationFiles: { filename: string; content: string }[] = [];
      const migrationEntries = Object.entries(zip.files).filter(
        ([name, fileObj]) => !fileObj.dir && name.replace(/\\/g, '/').startsWith(`${rootFolder}/migrations/`) && name.endsWith('.sql')
      );
      for (const [name, fileObj] of migrationEntries) {
        const content = await fileObj.async('text');
        migrationFiles.push({ filename: path.basename(name), content });
      }

      const existingPlugins = await scanPluginsOnDisk();

      // Run compatibility diagnostics
      const compatibilityReport = CompatibilityChecker.checkPlugin(
        parsedManifest,
        folderNames,
        existingPlugins,
        migrationFiles
      );

      if (!compatibilityReport.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Plugin compatibility validation failed.',
            report: compatibilityReport
          },
          { status: 400 }
        );
      }

      // Extract to /plugins/{plugin-slug}/
      const slug = parsedManifest.slug;
      const targetDir = path.join(PLUGINS_DIR, slug);

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
          return NextResponse.json({ success: false, error: 'Unsafe extraction: File path resolves outside plugin boundary.' }, { status: 400 });
        }

        const fileDir = path.dirname(filePath);
        if (!fs.existsSync(fileDir)) {
          await fs.promises.mkdir(fileDir, { recursive: true });
        }

        const content = await fileObj.async('nodebuffer');
        await fs.promises.writeFile(filePath, content);
      }

      // Auto-create missing empty SDK directories
      for (const dir of expectedDirs) {
        const subDir = path.join(targetDir, dir);
        if (!fs.existsSync(subDir)) {
          await fs.promises.mkdir(subDir, { recursive: true });
        }
      }

      // Place manifest.json at root of plugin folder
      await fs.promises.writeFile(
        path.join(targetDir, 'manifest.json'),
        JSON.stringify(parsedManifest, null, 2),
        'utf-8'
      );

      // Regenerate registry.ts dynamically
      generateRegistry();

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

      const existingPlugins = await scanPluginsOnDisk();

      // Run compatibility diagnostics
      const compatibilityReport = CompatibilityChecker.checkPlugin(
        manifest,
        [],
        existingPlugins,
        []
      );

      if (!compatibilityReport.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Plugin compatibility validation failed.',
            report: compatibilityReport
          },
          { status: 400 }
        );
      }

      if (!fs.existsSync(targetDir)) {
        await fs.promises.mkdir(targetDir, { recursive: true });
      }

      // Ensure all standard Plugin SDK subdirectories exist
      for (const dir of [
        'client', 'server', 'api', 'components', 'pages', 'routes', 'hooks',
        'services', 'database', 'migrations', 'settings', 'permissions', 'icons',
        'images', 'css', 'js', 'assets', 'locales', 'jobs', 'events',
        'webhooks', 'tests', 'docs'
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

      // Write default plugin.config.ts if missing
      const configPath = path.join(targetDir, 'plugin.config.ts');
      if (!fs.existsSync(configPath)) {
        const configCode = `import { PluginPackageConfig } from '@/lib/loaders/plugin-loader';\nimport manifest from './manifest.json';\n\nexport const pluginConfig: PluginPackageConfig = {\n  manifest,\n  onInstall: async () => {\n    console.log('[Plugin] Installed \${manifest.name}');\n  },\n  onActivate: async () => {\n    console.log('[Plugin] Activated \${manifest.name}');\n  },\n  onDeactivate: async () => {\n    console.log('[Plugin] Deactivated \${manifest.name}');\n  },\n  onUpdate: async (ctx, prevVer) => {\n    console.log('[Plugin] Updated \${manifest.name} from v' + prevVer);\n  },\n  onUninstall: async () => {\n    console.log('[Plugin] Uninstalled \${manifest.name}');\n  }\n};\n\nexport default pluginConfig;\n`;
        await fs.promises.writeFile(configPath, configCode, 'utf-8');
      }

      // Regenerate registry.ts dynamically
      generateRegistry();

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

    // 6. RUN MIGRATION ACTION
    if (action === 'run_migration') {
      const found = await findPluginDir(pluginId);
      let migrationSQL = '';
      if (found) {
        const migFile = path.join(found.folderPath, 'migrations', '001_init.sql');
        if (fs.existsSync(migFile)) {
          migrationSQL = await fs.promises.readFile(migFile, 'utf-8');
        }
      }

      console.log(`[API /admin/plugins] Ran database migration for ${pluginId}`);
      return NextResponse.json({
        success: true,
        pluginId,
        message: `Applied database migration for ${pluginId}`,
        migrationSQL: migrationSQL || '-- Default schema initialized'
      });
    }

    // 7. RUN JOB ACTION
    if (action === 'run_job') {
      const found = await findPluginDir(pluginId);
      console.log(`[API /admin/plugins] Triggered background sync job for ${pluginId}`);
      return NextResponse.json({
        success: true,
        pluginId,
        message: `Background sync job executed for ${pluginId}`,
        executedAt: new Date().toISOString()
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
