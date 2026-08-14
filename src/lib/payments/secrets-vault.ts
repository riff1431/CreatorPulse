import fs from 'fs';
import path from 'path';

// Store the vault file within the payments library, excluded from Git
const VAULT_FILE = path.join(process.cwd(), 'src/lib/payments/vault.json');

function readVault(): Record<string, Record<string, string>> {
  if (typeof window !== 'undefined') {
    throw new Error('Secrets vault cannot be read from the client side!');
  }
  
  try {
    if (fs.existsSync(VAULT_FILE)) {
      const data = fs.readFileSync(VAULT_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[Vault] Failed to read secrets vault', e);
  }
  return {};
}

function writeVault(vault: Record<string, Record<string, string>>) {
  if (typeof window !== 'undefined') {
    throw new Error('Secrets vault cannot be written from the client side!');
  }
  
  try {
    const dir = path.dirname(VAULT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(VAULT_FILE, JSON.stringify(vault, null, 2), 'utf8');
  } catch (e) {
    console.error('[Vault] Failed to write secrets vault', e);
  }
}

export function saveSecret(gatewayId: string, key: string, value: string): void {
  const vault = readVault();
  if (!vault[gatewayId]) {
    vault[gatewayId] = {};
  }
  vault[gatewayId][key] = value;
  writeVault(vault);
}

export function getSecrets(gatewayId: string): Record<string, string> {
  const vault = readVault();
  return vault[gatewayId] || {};
}

export function getSecret(gatewayId: string, key: string): string {
  const secrets = getSecrets(gatewayId);
  return secrets[key] || '';
}

export function hasSecret(gatewayId: string, key: string): boolean {
  return !!getSecret(gatewayId, key);
}

export function clearSecrets(gatewayId: string): void {
  const vault = readVault();
  if (vault[gatewayId]) {
    delete vault[gatewayId];
    writeVault(vault);
  }
}
