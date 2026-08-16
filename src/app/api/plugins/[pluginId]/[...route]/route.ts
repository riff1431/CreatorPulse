import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PLUGINS_DIR = path.join(process.cwd(), 'plugins');

/**
 * Helper to check plugin status and read manifest
 */
async function resolvePluginManifest(pluginId: string): Promise<{
  pluginDir: string;
  manifest: any | null;
  isEnabled: boolean;
  error?: string;
  status: number;
}> {
  const cleanId = pluginId.replace(/^plugin-/, '');
  
  // Search for directory matching slug or folder name
  let targetDir = path.join(PLUGINS_DIR, cleanId);
  if (!fs.existsSync(targetDir)) {
    // Try scanning plugins dir for matching id or slug inside manifest
    if (fs.existsSync(PLUGINS_DIR)) {
      const entries = await fs.promises.readdir(PLUGINS_DIR, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const testPath = path.join(PLUGINS_DIR, entry.name, 'manifest.json');
          if (fs.existsSync(testPath)) {
            try {
              const raw = await fs.promises.readFile(testPath, 'utf-8');
              const data = JSON.parse(raw);
              if (data.id === pluginId || data.slug === cleanId || data.slug === pluginId) {
                targetDir = path.join(PLUGINS_DIR, entry.name);
                break;
              }
            } catch {}
          }
        }
      }
    }
  }

  if (!fs.existsSync(targetDir)) {
    return {
      pluginDir: targetDir,
      manifest: null,
      isEnabled: false,
      error: `Plugin "${pluginId}" is not installed on disk.`,
      status: 404
    };
  }

  const manifestPath = path.join(targetDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return {
      pluginDir: targetDir,
      manifest: null,
      isEnabled: false,
      error: `Plugin "${pluginId}" manifest.json missing.`,
      status: 400
    };
  }

  try {
    const raw = await fs.promises.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(raw);

    // SECURITY GUARD: Check if plugin is enabled
    const isEnabled = manifest.isEnabled !== false;
    if (!isEnabled) {
      return {
        pluginDir: targetDir,
        manifest,
        isEnabled: false,
        error: `Security Guard: Plugin "${manifest.name || pluginId}" is currently deactivated. Endpoint access is disabled.`,
        status: 403
      };
    }

    return {
      pluginDir: targetDir,
      manifest,
      isEnabled: true,
      status: 200
    };
  } catch (err: any) {
    return {
      pluginDir: targetDir,
      manifest: null,
      isEnabled: false,
      error: `Malformed manifest JSON for "${pluginId}": ${err.message}`,
      status: 500
    };
  }
}

/**
 * Dynamic API route handler for all plugins
 * URL structure: /api/plugins/:pluginId/:route*
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ pluginId: string; route: string[] }> }
) {
  try {
    const { pluginId, route } = await params;
    const subRoute = (route || []).join('/');

    const resolved = await resolvePluginManifest(pluginId);
    if (!resolved.isEnabled) {
      return NextResponse.json(
        { success: false, error: resolved.error, pluginId, isEnabled: false },
        { status: resolved.status }
      );
    }

    const { manifest } = resolved;

    return NextResponse.json({
      success: true,
      pluginId: manifest.id,
      pluginName: manifest.name,
      version: manifest.version,
      route: subRoute,
      status: 'active',
      timestamp: new Date().toISOString(),
      data: {
        message: `Dynamic response from ${manifest.name} API gateway`,
        endpoint: `/api/plugins/${manifest.slug}/${subRoute}`
      }
    });
  } catch (error: any) {
    console.error('[API /api/plugins GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Plugin API routing failed' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pluginId: string; route: string[] }> }
) {
  try {
    const { pluginId, route } = await params;
    const subRoute = (route || []).join('/');

    const resolved = await resolvePluginManifest(pluginId);
    if (!resolved.isEnabled) {
      return NextResponse.json(
        { success: false, error: resolved.error, pluginId, isEnabled: false },
        { status: resolved.status }
      );
    }

    const { manifest } = resolved;

    let body = {};
    try {
      body = await request.json();
    } catch {}

    return NextResponse.json({
      success: true,
      pluginId: manifest.id,
      pluginName: manifest.name,
      version: manifest.version,
      route: subRoute,
      receivedPayload: body,
      processedAt: new Date().toISOString(),
      result: {
        status: 'completed',
        message: `Successfully processed POST payload by ${manifest.name}`
      }
    });
  } catch (error: any) {
    console.error('[API /api/plugins POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Plugin POST routing failed' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ pluginId: string; route: string[] }> }
) {
  return POST(request, { params });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ pluginId: string; route: string[] }> }
) {
  return GET(request, { params });
}
