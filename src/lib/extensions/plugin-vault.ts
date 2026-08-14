import fs from 'fs';
import path from 'path';

const VAULT_FILE = path.join(process.cwd(), 'src/lib/extensions/plugin-vault.json');

function readVault(): Record<string, { licenseKey: string; licenseStatus: string }> {
  if (typeof window !== 'undefined') {
    throw new Error('Plugin vault cannot be read from the client side!');
  }
  
  try {
    if (fs.existsSync(VAULT_FILE)) {
      const data = fs.readFileSync(VAULT_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[Plugin Vault] Failed to read plugin vault', e);
  }
  return {};
}

function writeVault(vault: Record<string, { licenseKey: string; licenseStatus: string }>) {
  if (typeof window !== 'undefined') {
    throw new Error('Plugin vault cannot be written from the client side!');
  }
  
  try {
    const dir = path.dirname(VAULT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(VAULT_FILE, JSON.stringify(vault, null, 2), 'utf8');
  } catch (e) {
    console.error('[Plugin Vault] Failed to write plugin vault', e);
  }
}

export function savePluginLicense(pluginId: string, licenseKey: string, status: 'licensed' | 'unlicensed') {
  const vault = readVault();
  vault[pluginId] = { licenseKey, licenseStatus: status };
  writeVault(vault);
}

export function getPluginLicenses(): Record<string, { licenseKey: string; licenseStatus: string }> {
  return readVault();
}

export function getPluginLicense(pluginId: string): { licenseKey: string; licenseStatus: string } | null {
  const vault = readVault();
  return vault[pluginId] || null;
}

export function clearPluginLicense(pluginId: string) {
  const vault = readVault();
  if (vault[pluginId]) {
    delete vault[pluginId];
    writeVault(vault);
  }
}
