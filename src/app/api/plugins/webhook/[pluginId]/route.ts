import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PLUGINS_DIR = path.join(process.cwd(), 'plugins');

/**
 * Dynamic Webhook Receiver for all plugins
 * URL structure: /api/plugins/webhook/:pluginId
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ pluginId: string }> }
) {
  try {
    const { pluginId } = await params;
    const cleanId = pluginId.replace(/^plugin-/, '');
    const pluginDir = path.join(PLUGINS_DIR, cleanId);

    if (!fs.existsSync(pluginDir)) {
      return NextResponse.json(
        { success: false, error: `Plugin "${pluginId}" not found for webhook dispatch.` },
        { status: 404 }
      );
    }

    let payload: any = {};
    try {
      payload = await request.json();
    } catch {
      payload = { raw: await request.text() };
    }

    console.log(`[Plugin Webhook] Received webhook for ${pluginId}:`, payload);

    return NextResponse.json({
      success: true,
      pluginId,
      status: 'acknowledged',
      receivedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[API /api/plugins/webhook] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Plugin webhook handling failed' },
      { status: 500 }
    );
  }
}
