import { NextResponse } from 'next/server';
import {
  saveThemeLicense,
  getThemeLicenses,
  clearThemeLicense,
  validateLicenseKeyFormat,
  generateThemeLicenseKey,
} from '@/lib/extensions/theme-vault';
import { logAuditEvent } from '@/lib/extensions/package-installer';

/**
 * GET /api/admin/themes/license
 * Returns all stored theme licenses from the server-side vault.
 */
export async function GET() {
  try {
    const licenses = getThemeLicenses();
    return NextResponse.json({ success: true, licenses });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/themes/license
 * Verifies and saves a theme license key.
 *
 * Body: { themeId: string, licenseKey: string }
 *
 * Accepted key formats:
 *   CP-THEME-XXXX-XXXX-XXXX  — structured CreatorPulse key
 *   Any alphanumeric string ≥ 10 chars — marketplace purchase codes
 */
export async function POST(req: Request) {
  try {
    const { themeId, licenseKey } = await req.json();

    if (!themeId || !licenseKey) {
      return NextResponse.json(
        { error: 'Missing themeId or licenseKey parameters.' },
        { status: 400 }
      );
    }

    const trimmedKey = licenseKey.trim();

    if (!validateLicenseKeyFormat(trimmedKey)) {
      return NextResponse.json(
        {
          error:
            'Invalid license key format. Please enter a valid CreatorPulse Theme License (e.g. CP-THEME-7X89-KL22-901B) or a valid Envato purchase code (at least 10 characters).',
        },
        { status: 400 }
      );
    }

    // Persist to secure server-side vault
    saveThemeLicense(themeId, trimmedKey, 'licensed');

    logAuditEvent({
      action: 'THEME_ACTIVATED',
      entityType: 'theme',
      entityName: themeId,
      details: `Theme license key verified and stored securely server-side for theme "${themeId}".`,
      severity: 'success',
    });

    return NextResponse.json({ success: true, licenseStatus: 'licensed' });
  } catch (e: any) {
    return NextResponse.json(
      { error: `Failed to save secure license vault: ${e.message}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/themes/license
 * Revokes and removes a theme license from the vault.
 *
 * Body: { themeId: string }
 */
export async function DELETE(req: Request) {
  try {
    const { themeId } = await req.json();

    if (!themeId) {
      return NextResponse.json(
        { error: 'Missing themeId parameter.' },
        { status: 400 }
      );
    }

    clearThemeLicense(themeId);

    logAuditEvent({
      action: 'THEME_DELETED',
      entityType: 'theme',
      entityName: themeId,
      details: `Theme license key revoked and removed from secure server-side vault.`,
      severity: 'warning',
    });

    return NextResponse.json({ success: true, licenseStatus: 'unlicensed' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/themes/license
 * Generates and returns a new CreatorPulse theme license key.
 * (For development / testing use only — in production, generate keys
 *  from your license management panel and validate via your own server.)
 *
 * Body: { themeId: string }
 */
export async function PATCH(req: Request) {
  try {
    const { themeId } = await req.json();

    if (!themeId) {
      return NextResponse.json(
        { error: 'Missing themeId parameter.' },
        { status: 400 }
      );
    }

    const newKey = generateThemeLicenseKey();

    // Auto-save the generated key
    saveThemeLicense(themeId, newKey, 'licensed');

    logAuditEvent({
      action: 'THEME_ACTIVATED',
      entityType: 'theme',
      entityName: themeId,
      details: `New license key generated and stored for theme "${themeId}".`,
      severity: 'info',
    });

    return NextResponse.json({
      success: true,
      licenseKey: newKey,
      licenseStatus: 'licensed',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
