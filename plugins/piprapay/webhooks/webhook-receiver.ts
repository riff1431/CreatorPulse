import { PipraPayGatewayAdapter } from '../services/piprapay-adapter';

/**
 * PipraPay Webhook Receiver Controller
 */
export async function receivePipraPayWebhook(
  headers: Record<string, string>,
  rawBody: string,
  secrets: Record<string, string>
) {
  const adapter = new PipraPayGatewayAdapter();

  const isValid = await adapter.verifyWebhook(headers, rawBody, secrets);
  if (!isValid) {
    return {
      success: false,
      status: 401,
      error: 'Invalid PipraPay webhook cryptographic signature.'
    };
  }

  let payload: any = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return {
      success: false,
      status: 400,
      error: 'Malformed JSON webhook body.'
    };
  }

  const result = await adapter.handleWebhook(payload, secrets);
  return {
    success: true,
    status: 200,
    result
  };
}
