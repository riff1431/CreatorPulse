import fs from 'fs';
import path from 'path';

const VAULT_FILE = path.join(process.cwd(), 'src/lib/extensions/theme-vault.json');

export interface ThemeLicenseEntry {
  licenseKey: string;
  licenseStatus: 'licensed' | 'unlicensed' | 'exempt';
  activatedAt: string;
}

function readVault(): Record<string, ThemeLicenseEntry> {
  if (typeof window !== 'undefined') {
    throw new Error('Theme vault cannot be read from the client side!');
  }
  try {
    if (fs.existsSync(VAULT_FILE)) {
      const data = fs.readFileSync(VAULT_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[Theme Vault] Failed to read theme vault', e);
  }
  return {};
}

function writeVault(vault: Record<string, ThemeLicenseEntry>) {
  if (typeof window !== 'undefined') {
    throw new Error('Theme vault cannot be written from the client side!');
  }
  try {
    const dir = path.dirname(VAULT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(VAULT_FILE, JSON.stringify(vault, null, 2), 'utf8');
  } catch (e) {
    console.error('[Theme Vault] Failed to write theme vault', e);
  }
}

/** Save or update a theme license in the secure vault */
export function saveThemeLicense(
  themeId: string,
  licenseKey: string,
  status: 'licensed' | 'unlicensed' | 'exempt'
) {
  const vault = readVault();
  vault[themeId] = {
    licenseKey,
    licenseStatus: status,
    activatedAt: new Date().toISOString(),
  };
  writeVault(vault);
}

/** Read all theme licenses */
export function getThemeLicenses(): Record<string, ThemeLicenseEntry> {
  return readVault();
}

/** Read a single theme's license entry */
export function getThemeLicense(themeId: string): ThemeLicenseEntry | null {
  const vault = readVault();
  return vault[themeId] || null;
}

/** Remove a theme license from the vault */
export function clearThemeLicense(themeId: string) {
  const vault = readVault();
  if (vault[themeId]) {
    delete vault[themeId];
    writeVault(vault);
  }
}

/**
 * Validate a license key string.
 * Accepted formats:
 *   - CP-THEME-XXXX-XXXX-XXXX  (structured CreatorPulse key)
 *   - Any alphanumeric string >= 10 characters (purchase codes from marketplaces)
 */
export function validateLicenseKeyFormat(key: string): boolean {
  const trimmed = key.trim();
  const structuredPattern =
    /^CP-THEME-[A-Z0-9]{4,8}-[A-Z0-9]{4,8}-[A-Z0-9]{4,8}$/i;
  const genericPattern = /^[a-zA-Z0-9\-]{10,}$/;
  return structuredPattern.test(trimmed) || genericPattern.test(trimmed);
}

/**
 * Generate a new CreatorPulse theme license key.
 * Format: CP-THEME-XXXX-XXXX-XXXX
 */
export function generateThemeLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = (len: number) =>
    Array.from({ length: len }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  return `CP-THEME-${segment(4)}-${segment(4)}-${segment(4)}`;
}
