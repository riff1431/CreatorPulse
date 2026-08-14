import { NextResponse } from 'next/server';
import { getGatewayAdapter, logPaymentEvent } from '@/lib/payments/payment-service';
import { getSecrets } from '@/lib/payments/secrets-vault';

export async function POST(req: Request, { params }: { params: Promise<{ gateway: string }> }) {
  // Await params to support Next.js 15/16 asynchronous routing context
  const { gateway } = await params;
  const gatewayId = `plugin-${gateway}`;

  try {
    const adapter = getGatewayAdapter(gatewayId);
    if (!adapter) {
      logPaymentEvent({
        gatewayId,
        eventType: 'ERROR',
        status: 'Failed',
        details: `Webhook endpoint hit for unregistered gateway: ${gateway}`
      });
      return NextResponse.json(
        { error: `Webhook adapter not registered: ${gateway}` },
        { status: 404 }
      );
    }

    // Retrieve transmission headers
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    // Obtain raw body payload (mandatory for cryptographic signature checks)
    const rawBody = await req.text();

    // Fetch secrets securely from server-side vault
    const secrets = getSecrets(gatewayId);

    // Verify cryptographic webhook signature
    const isSignatureValid = await adapter.verifyWebhook(headers, rawBody, secrets);
    if (!isSignatureValid) {
      logPaymentEvent({
        gatewayId,
        eventType: 'ERROR',
        status: 'Failed',
        details: 'Webhook cryptographic signature validation failed.'
      });
      return NextResponse.json(
        { error: 'Invalid webhook signature.' },
        { status: 401 }
      );
    }

    // Parse JSON payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (parseError) {
      return NextResponse.json({ error: 'Malformed JSON payload.' }, { status: 400 });
    }

    // Handle webhook event and log outcome
    const webhookResult = await adapter.handleWebhook(payload, secrets);

    logPaymentEvent({
      gatewayId,
      eventType: 'WEBHOOK',
      transactionId: webhookResult.transactionId || '',
      status: webhookResult.status || 'Completed',
      details: `Parsed webhook successfully. Event: ${webhookResult.message}`
    });

    return NextResponse.json({
      success: true,
      handled: webhookResult.handled,
      transactionId: webhookResult.transactionId,
      status: webhookResult.status,
      message: webhookResult.message
    });
  } catch (e: any) {
    console.error(`[Webhook API Error] Gateway: ${gateway}`, e);
    return NextResponse.json(
      { error: `Internal webhook processing error: ${e.message}` },
      { status: 500 }
    );
  }
}
