import fs from 'fs';
import path from 'path';
import { StripeGatewayAdapter } from './adapters/stripe';
import { PayPalGatewayAdapter } from './adapters/paypal';
import { MockGatewayAdapter } from './adapters/mock';
import { getSecrets } from './secrets-vault';
import {
  PaymentGatewayAdapter,
  CheckoutParams,
  SubscriptionParams,
  RefundParams,
  WalletFundingParams,
  PayoutParams,
  PaymentResult,
  RefundResult,
  PayoutResult,
  WebhookResult
} from './types';

// Registry of available gateway adapters
const registry: Record<string, PaymentGatewayAdapter> = {
  'plugin-stripe': new StripeGatewayAdapter(),
  'plugin-paypal': new PayPalGatewayAdapter(),
  'plugin-mock': new MockGatewayAdapter()
};

// Paths for persistent local logging and idempotency
const IDEMPOTENCY_FILE = path.join(process.cwd(), 'src/lib/payments/idempotency.json');
const LOGS_FILE = path.join(process.cwd(), 'src/lib/payments/payment-logs.json');

// Core App Version for Compatibility Checks
const CORE_APP_VERSION = '1.2.0';

/**
 * Returns a gateway adapter by ID.
 */
export function getGatewayAdapter(id: string): PaymentGatewayAdapter | null {
  return registry[id] || null;
}

/**
 * Validates that a plugin is compatible with the core app version.
 */
export function isPluginCompatible(minAppVersion: string): boolean {
  try {
    const coreParts = CORE_APP_VERSION.split('.').map(Number);
    const pluginParts = minAppVersion.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      const c = coreParts[i] || 0;
      const p = pluginParts[i] || 0;
      if (c > p) return true;
      if (p > c) return false;
    }
    return true; // Exact match
  } catch (e) {
    return false;
  }
}

/**
 * Loads the idempotency store.
 */
function readIdempotencyStore(): Record<string, any> {
  try {
    if (fs.existsSync(IDEMPOTENCY_FILE)) {
      return JSON.parse(fs.readFileSync(IDEMPOTENCY_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('[Payment Service] Failed to read idempotency store', e);
  }
  return {};
}

/**
 * Saves a result to the idempotency store.
 */
function saveIdempotencyResult(key: string, result: any): void {
  try {
    const store = readIdempotencyStore();
    store[key] = {
      result,
      timestamp: new Date().toISOString()
    };
    
    const dir = path.dirname(IDEMPOTENCY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(IDEMPOTENCY_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('[Payment Service] Failed to save idempotency key', e);
  }
}

/**
 * Logs a payment gateway event or transaction status change.
 */
export function logPaymentEvent(event: {
  gatewayId: string;
  eventType: 'CHECKOUT' | 'SUBSCRIPTION' | 'REFUND' | 'PAYOUT' | 'WEBHOOK' | 'ERROR';
  transactionId?: string;
  amount?: number;
  currency?: string;
  status: string;
  details: string;
}): void {
  try {
    let logs: any[] = [];
    if (fs.existsSync(LOGS_FILE)) {
      logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
    }

    const logEntry = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...event
    };

    logs.unshift(logEntry);
    
    // Retain last 500 logs
    const trimmedLogs = logs.slice(0, 500);

    const dir = path.dirname(LOGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOGS_FILE, JSON.stringify(trimmedLogs, null, 2), 'utf8');
    console.log(`[Payment Event Logged] ${event.eventType} - ${event.status}: ${event.details}`);
  } catch (e) {
    console.error('[Payment Service] Failed to write event log', e);
  }
}

/**
 * Retrieves payment service logs.
 */
export function getPaymentLogs(): any[] {
  try {
    if (fs.existsSync(LOGS_FILE)) {
      return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

/**
 * Execution helper wraps the gateway operations, handles secret retrieval, logging, and errors.
 */
export async function executeGatewayOperation<T>(
  gatewayId: string,
  operationName: 'checkout' | 'subscription' | 'refund' | 'funding' | 'payout',
  params: any,
  settings: Record<string, any>,
  executeFn: (adapter: PaymentGatewayAdapter, secrets: Record<string, string>) => Promise<T>
): Promise<T> {
  const adapter = getGatewayAdapter(gatewayId);
  if (!adapter) {
    logPaymentEvent({
      gatewayId,
      eventType: 'ERROR',
      status: 'Failed',
      details: `Payment gateway provider "${gatewayId}" is not installed or registry is missing.`
    });
    throw new Error(`Payment gateway "${gatewayId}" not found in system registry.`);
  }

  // Verify compatibility
  const minVersion = settings.minAppVersion || '1.0.0';
  if (!isPluginCompatible(minVersion)) {
    logPaymentEvent({
      gatewayId,
      eventType: 'ERROR',
      status: 'Failed',
      details: `Gateway "${gatewayId}" is incompatible. Requires min app version ${minVersion}, core is ${CORE_APP_VERSION}.`
    });
    throw new Error(`Gateway compatibility check failed. Requires Core v${minVersion}.`);
  }

  // Load server-side secret keys
  const secrets = getSecrets(gatewayId);

  // Check idempotency if key exists
  const idempotencyKey = params.idempotencyKey;
  if (idempotencyKey) {
    const store = readIdempotencyStore();
    if (store[idempotencyKey]) {
      console.log(`[Payment Service] Idempotency cache hit for key "${idempotencyKey}". Returning duplicate payload.`);
      logPaymentEvent({
        gatewayId,
        eventType: 'WEBHOOK',
        status: 'Completed',
        details: `Idempotency hit resolved for duplicate execution key: ${idempotencyKey}`
      });
      return store[idempotencyKey].result as T;
    }
  }

  try {
    const result = await executeFn(adapter, secrets);

    // Save to idempotency store on success/pending
    if (idempotencyKey && (result as any).success) {
      saveIdempotencyResult(idempotencyKey, result);
    }

    // Log the successful outcome
    logPaymentEvent({
      gatewayId,
      eventType: operationName.toUpperCase() as any,
      transactionId: (result as any).transactionId || (result as any).refundId || (result as any).payoutId || '',
      amount: params.amount,
      currency: params.currency || 'USD',
      status: (result as any).status || 'Completed',
      details: `Executed ${operationName} successfully. Message: ${(result as any).message}`
    });

    return result;
  } catch (err: any) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown exception';
    logPaymentEvent({
      gatewayId,
      eventType: 'ERROR',
      status: 'Failed',
      details: `Failed to execute ${operationName} via ${gatewayId}: ${errorMsg}`
    });
    throw err;
  }
}
