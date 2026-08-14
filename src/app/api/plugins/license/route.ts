import { NextResponse } from 'next/server';
import { savePluginLicense, getPluginLicenses, clearPluginLicense } from '@/lib/extensions/plugin-vault';
import { logAuditEvent } from '@/lib/extensions/package-installer';

export async function GET() {
  try {
    const licenses = getPluginLicenses();
    return NextResponse.json({ success: true, licenses });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { pluginId, licenseKey } = await req.json();

    if (!pluginId || !licenseKey) {
      return NextResponse.json(
        { error: 'Missing pluginId or licenseKey parameters.' },
        { status: 400 }
      );
    }

    const trimmedKey = licenseKey.trim();

    // License validation rules (similar to themes)
    // Needs to start with "CP-PLUGIN-" or be at least 12 alphanumeric characters
    const hasCorrectPrefix = trimmedKey.startsWith('CP-PLUGIN-');
    const isAlphanumeric12 = /^[a-zA-Z0-9-]{12,}$/.test(trimmedKey);

    if (!hasCorrectPrefix && !isAlphanumeric12) {
      return NextResponse.json(
        { 
          error: 'Invalid license key format. Please enter a valid CreatorPulse Plugin License (e.g. CP-PLUGIN-ABCD-1234-XYZ9).' 
        },
        { status: 400 }
      );
    }

    // Save license status to the secure server vault
    savePluginLicense(pluginId, trimmedKey, 'licensed');

    logAuditEvent({
      action: 'PLUGIN_ACTIVATED',
      entityType: 'plugin',
      entityName: pluginId,
      details: `License key verified and stored securely server-side for plugin ${pluginId}.`,
      severity: 'success'
    });

    return NextResponse.json({ success: true, licenseStatus: 'licensed' });
  } catch (e: any) {
    return NextResponse.json(
      { error: `Failed to save secure license vault: ${e.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { pluginId } = await req.json();

    if (!pluginId) {
      return NextResponse.json(
        { error: 'Missing pluginId parameter.' },
        { status: 400 }
      );
    }

    clearPluginLicense(pluginId);

    logAuditEvent({
      action: 'PLUGIN_DEACTIVATED',
      entityType: 'plugin',
      entityName: pluginId,
      details: `License key revoked and removed from secure server-side vault.`,
      severity: 'warning'
    });

    return NextResponse.json({ success: true, licenseStatus: 'unlicensed' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
