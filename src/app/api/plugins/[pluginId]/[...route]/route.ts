import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PLUGINS_DIR = path.join(process.cwd(), 'plugins');

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

    const cleanId = pluginId.replace(/^plugin-/, '');
    const pluginDir = path.join(PLUGINS_DIR, cleanId);

    if (!fs.existsSync(pluginDir)) {
      return NextResponse.json(
        { success: false, error: `Plugin "${pluginId}" not found on disk.` },
        { status: 404 }
      );
    }

    const manifestPath = path.join(pluginDir, 'manifest.json');
    let manifest: any = { id: pluginId, name: cleanId };
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'));
    }

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
        endpoint: `/api/plugins/${cleanId}/${subRoute}`
      }
    });
  } catch (error: any) {
    console.error('[API /api/plugins] Error:', error);
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
    const cleanId = pluginId.replace(/^plugin-/, '');
    const pluginDir = path.join(PLUGINS_DIR, cleanId);

    let body = {};
    try {
      body = await request.json();
    } catch {}

    if (!fs.existsSync(pluginDir)) {
      return NextResponse.json(
        { success: false, error: `Plugin "${pluginId}" not found on disk.` },
        { status: 404 }
      );
    }

    const manifestPath = path.join(pluginDir, 'manifest.json');
    let manifest: any = { id: pluginId, name: cleanId };
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'));
    }

    return NextResponse.json({
      success: true,
      pluginId: manifest.id,
      pluginName: manifest.name,
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
