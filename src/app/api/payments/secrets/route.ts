import { NextResponse } from 'next/server';
import { saveSecret, clearSecrets } from '@/lib/payments/secrets-vault';
import { logPaymentEvent } from '@/lib/payments/payment-service';

export async function POST(req: Request) {
  try {
    const { gatewayId, secrets } = await req.json();

    if (!gatewayId || typeof secrets !== 'object') {
      return NextResponse.json(
        { error: 'Missing gatewayId or secrets payload.' },
        { status: 400 }
      );
    }

    let updatedCount = 0;
    for (const [key, value] of Object.entries(secrets)) {
      // If client sends standard placeholder value, ignore it to prevent overwriting actual secret with mask
      if (value === '••••••••' || value === '••••••••••••••••') {
        continue;
      }
      
      saveSecret(gatewayId, key, value as string);
      updatedCount++;
    }

    logPaymentEvent({
      gatewayId,
      eventType: 'CHECKOUT',
      status: 'Completed',
      details: `Saved ${updatedCount} confidential credentials server-side.`
    });

    return NextResponse.json({ success: true, updatedCount });
  } catch (e: any) {
    console.error('[Secrets API] Error saving secret keys', e);
    return NextResponse.json(
      { error: `Server failed to store secret vault items: ${e.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { gatewayId } = await req.json();
    if (!gatewayId) {
      return NextResponse.json({ error: 'Missing gatewayId parameter' }, { status: 400 });
    }

    clearSecrets(gatewayId);
    logPaymentEvent({
      gatewayId,
      eventType: 'CHECKOUT',
      status: 'Completed',
      details: 'Cleared all secrets from vault.'
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
