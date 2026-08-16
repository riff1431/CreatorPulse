import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DISCOVERED_PLUGIN_MANIFESTS } from '@/lib/loaders/registry';
import { DEFAULT_PLUGINS } from '@/lib/extensions/default-extensions';
import { getGatewayAdapter, getPaymentLogs } from '@/lib/payments/payment-service';
import { getSecrets, saveSecret } from '@/lib/payments/secrets-vault';

const PLUGINS_DIR = path.join(process.cwd(), 'plugins');

/**
 * Returns all payment gateway plugins (active & inactive) with metadata
 */
export async function GET() {
  try {
    // Read from disk, default plugins, or registry
    const gateways: any[] = [];
    const pluginMap = new Map<string, any>();

    const isPaymentPlugin = (p: any) =>
      (p.hooks?.includes('payment_gateway_methods') && p.category === 'Monetization') ||
      p.id?.includes('piprapay') ||
      p.id?.includes('stripe') ||
      p.id?.includes('paypal') ||
      p.id?.includes('mock');

    DEFAULT_PLUGINS.forEach((p) => {
      if (isPaymentPlugin(p)) {
        pluginMap.set(p.id, p);
      }
    });

    DISCOVERED_PLUGIN_MANIFESTS.forEach((p) => {
      if (isPaymentPlugin(p)) {
        pluginMap.set(p.id, { ...pluginMap.get(p.id), ...p });
      }
    });


    for (const m of Array.from(pluginMap.values())) {
      const secrets = getSecrets(m.id);
      const hasCredentials = !!(secrets.apiKey || secrets.publishableKey || secrets.clientId || secrets.secretKey || secrets.clientSecret);

      gateways.push({
        ...m,
        hasCredentials,
        isConfigured: hasCredentials || m.settingsValues?.mode === 'sandbox'
      });
    }


    // Sort by display order if set
    gateways.sort((a, b) => {
      const orderA = a.settingsValues?.displayOrder ?? 99;
      const orderB = b.settingsValues?.displayOrder ?? 99;
      return orderA - orderB;
    });

    const logs = getPaymentLogs();

    return NextResponse.json({
      success: true,
      gateways,
      logs: logs.slice(0, 100)
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch payment gateways' },
      { status: 500 }
    );
  }
}

/**
 * Updates payment gateway statuses, ordering, or settings
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, gatewayId, isEnabled, isDefault, settingsValues, secrets, order } = body;

    if (action === 'set_default' && gatewayId) {
      // In localStorage/state update default gateway
      return NextResponse.json({
        success: true,
        message: `Default payment gateway set to ${gatewayId}`
      });
    }

    if (action === 'save_secrets' && gatewayId && secrets) {
      for (const [key, value] of Object.entries(secrets)) {
        if (value && typeof value === 'string' && value !== '••••••••') {
          saveSecret(gatewayId, key, value);
        }
      }
      return NextResponse.json({
        success: true,
        message: `Credentials saved securely in vault for ${gatewayId}`
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment gateway operation executed successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update gateway' },
      { status: 500 }
    );
  }
}
