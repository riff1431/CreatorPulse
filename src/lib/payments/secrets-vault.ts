function getNodeFs() {
  if (typeof window !== 'undefined') return null;
  try {
    const req = eval('require');
    return {
      fs: req('fs'),
      path: req('path')
    };
  } catch {
    return null;
  }
}

function getVaultFile(): string {
  const node = getNodeFs();
  if (!node || !node.path || typeof process === 'undefined' || !process.cwd) return '';
  return node.path.join(process.cwd(), 'src/lib/payments/vault.json');
}

function readVault(): Record<string, Record<string, string>> {
  if (typeof window !== 'undefined') {
    throw new Error('Secrets vault cannot be read from the client side!');
  }
  
  try {
    const node = getNodeFs();
    const vaultFile = getVaultFile();
    if (node && node.fs && vaultFile && node.fs.existsSync(vaultFile)) {
      const data = node.fs.readFileSync(vaultFile, 'utf8');
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
    const node = getNodeFs();
    const vaultFile = getVaultFile();
    if (node && node.fs && node.path && vaultFile) {
      const dir = node.path.dirname(vaultFile);
      if (!node.fs.existsSync(dir)) {
        node.fs.mkdirSync(dir, { recursive: true });
      }
      node.fs.writeFileSync(vaultFile, JSON.stringify(vault, null, 2), 'utf8');
    }
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
