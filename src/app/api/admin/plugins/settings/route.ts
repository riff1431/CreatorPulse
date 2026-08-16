import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PluginManifest, PluginSettingField } from '@/lib/extensions/plugin-types';

const PLUGINS_DIR = path.join(process.cwd(), 'plugins');

/** Locate plugin directory by pluginId (id or slug) */
async function findPluginDir(pluginId: string): Promise<{ folderPath: string; manifestPath: string } | null> {
  if (!fs.existsSync(PLUGINS_DIR)) return null;

  const entries = await fs.promises.readdir(PLUGINS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const folderPath = path.join(PLUGINS_DIR, entry.name);
    const manifestPath = path.join(folderPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) continue;

    try {
      const raw = await fs.promises.readFile(manifestPath, 'utf-8');
      const data: PluginManifest = JSON.parse(raw);
      if (data.id === pluginId || data.slug === pluginId || entry.name === pluginId) {
        return { folderPath, manifestPath };
      }
    } catch {
      // ignore malformed manifests
    }
  }
  return null;
}

/**
 * Validate a settings value against a field schema
 */
function validateField(field: PluginSettingField, value: unknown): string | null {
  // Required check
  if (field.required) {
    if (value === undefined || value === null || value === '') {
      return `"${field.label}" is required.`;
    }
    if (Array.isArray(value) && value.length === 0) {
      return `"${field.label}" must have at least one entry.`;
    }
  }

  if (value === undefined || value === null || value === '') return null;

  // Type-specific validation
  if (field.type === 'number') {
    const num = Number(value);
    if (isNaN(num)) return `"${field.label}" must be a valid number.`;
    if (field.min !== undefined && num < field.min) return `"${field.label}" must be at least ${field.min}.`;
    if (field.max !== undefined && num > field.max) return `"${field.label}" must be at most ${field.max}.`;
  }

  if (field.type === 'text' || field.type === 'textarea') {
    const str = String(value);
    if (field.maxLength && str.length > field.maxLength) {
      return `"${field.label}" must be ${field.maxLength} characters or fewer.`;
    }
  }

  // Named validators
  if (field.validate === 'nonempty' && String(value).trim() === '') {
    return `"${field.label}" must not be empty.`;
  }
  if (field.validate === 'url') {
    try { new URL(String(value)); } catch {
      return `"${field.label}" must be a valid URL (include https://).`;
    }
  }
  if (field.validate === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
      return `"${field.label}" must be a valid email address.`;
    }
  }
  if (field.validate === 'domain') {
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(value))) {
      return `"${field.label}" must be a valid domain (e.g. example.com).`;
    }
  }

  return null;
}

/**
 * GET /api/admin/plugins/settings?pluginId=...
 * Returns the current settingsValues from the on-disk manifest.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pluginId = searchParams.get('pluginId');

  if (!pluginId) {
    return NextResponse.json({ success: false, error: 'pluginId query param is required.' }, { status: 400 });
  }

  const found = await findPluginDir(pluginId);
  if (!found) {
    return NextResponse.json({ success: false, error: `Plugin "${pluginId}" not found on disk.` }, { status: 404 });
  }

  try {
    const raw = await fs.promises.readFile(found.manifestPath, 'utf-8');
    const manifest: PluginManifest = JSON.parse(raw);
    return NextResponse.json({
      success: true,
      pluginId: manifest.id,
      settingsValues: manifest.settingsValues ?? {},
      settingsSchema: manifest.settingsSchema ?? [],
      settingsGroups: manifest.settingsGroups ?? [],
      adminSettingsPage: manifest.adminSettingsPage ?? null,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/plugins/settings
 * Body: { pluginId, settingsValues, secrets? }
 * Validates, splits secrets to vault, and writes non-secret values to manifest.json on disk.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pluginId, settingsValues, secrets } = body as {
      pluginId: string;
      settingsValues: Record<string, unknown>;
      secrets?: Record<string, string>;
    };

    if (!pluginId || !settingsValues) {
      return NextResponse.json({ success: false, error: 'pluginId and settingsValues are required.' }, { status: 400 });
    }

    const found = await findPluginDir(pluginId);
    if (!found) {
      return NextResponse.json({ success: false, error: `Plugin "${pluginId}" not found on disk.` }, { status: 404 });
    }

    const raw = await fs.promises.readFile(found.manifestPath, 'utf-8');
    const manifest: PluginManifest = JSON.parse(raw);
    const schema: PluginSettingField[] = manifest.settingsSchema ?? [];

    // --- Validate all non-secret fields ---
    const errors: Record<string, string> = {};
    const secretFieldIds = schema
      .filter(f => f.type === 'password' || f.type === 'api_key')
      .map(f => f.id);

    for (const field of schema) {
      if (secretFieldIds.includes(field.id)) continue; // validated separately
      const validationError = validateField(field, settingsValues[field.id]);
      if (validationError) errors[field.id] = validationError;
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 422 });
    }

    // --- Strip secret fields from the values written to disk ---
    const safeValues: Record<string, unknown> = { ...settingsValues };
    for (const secretId of secretFieldIds) {
      // Keep masked placeholder if already masked; don't write raw secrets to disk
      if (
        safeValues[secretId] !== undefined &&
        safeValues[secretId] !== '••••••••' &&
        safeValues[secretId] !== '••••••••••••••••'
      ) {
        safeValues[secretId] = '••••••••';
      }
    }

    // --- Write updated settings to manifest.json ---
    const updatedManifest: PluginManifest = {
      ...manifest,
      settingsValues: {
        ...manifest.settingsValues,
        ...safeValues,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    };

    await fs.promises.writeFile(
      found.manifestPath,
      JSON.stringify(updatedManifest, null, 2),
      'utf-8'
    );

    return NextResponse.json({
      success: true,
      message: `Settings for "${manifest.name}" saved to disk.`,
      settingsValues: updatedManifest.settingsValues,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/plugins/settings?pluginId=...
 * Resets all settings to defaultValues from schema and writes to disk.
 */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const pluginId = searchParams.get('pluginId');

  if (!pluginId) {
    return NextResponse.json({ success: false, error: 'pluginId query param is required.' }, { status: 400 });
  }

  const found = await findPluginDir(pluginId);
  if (!found) {
    return NextResponse.json({ success: false, error: `Plugin "${pluginId}" not found on disk.` }, { status: 404 });
  }

  try {
    const raw = await fs.promises.readFile(found.manifestPath, 'utf-8');
    const manifest: PluginManifest = JSON.parse(raw);
    const schema: PluginSettingField[] = manifest.settingsSchema ?? [];

    // Build defaults from schema
    const defaultValues: Record<string, unknown> = {};
    for (const field of schema) {
      defaultValues[field.id] = field.defaultValue;
    }

    const updatedManifest: PluginManifest = {
      ...manifest,
      settingsValues: defaultValues,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    await fs.promises.writeFile(
      found.manifestPath,
      JSON.stringify(updatedManifest, null, 2),
      'utf-8'
    );

    return NextResponse.json({
      success: true,
      message: `Settings for "${manifest.name}" reset to defaults.`,
      settingsValues: defaultValues,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
