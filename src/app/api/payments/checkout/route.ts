import { NextResponse } from 'next/server';
import { executeGatewayOperation } from '@/lib/payments/payment-service';

export async function POST(req: Request) {
  try {
    const { gatewayId, type, params, settings } = await req.json();

    if (!gatewayId || !type || !params || !settings) {
      return NextResponse.json(
        { error: 'Missing required request fields: gatewayId, type, params, or settings.' },
        { status: 400 }
      );
    }

    let result;
    if (type === 'checkout') {
      result = await executeGatewayOperation(
        gatewayId,
        'checkout',
        params,
        settings,
        (adapter, secrets) => adapter.executeCheckout(params, settings, secrets)
      );
    } else if (type === 'subscription') {
      result = await executeGatewayOperation(
        gatewayId,
        'subscription',
        params,
        settings,
        (adapter, secrets) => adapter.executeSubscription(params, settings, secrets)
      );
    } else if (type === 'funding') {
      result = await executeGatewayOperation(
        gatewayId,
        'funding',
        params,
        settings,
        (adapter, secrets) => adapter.executeWalletFunding(params, settings, secrets)
      );
    } else if (type === 'payout') {
      result = await executeGatewayOperation(
        gatewayId,
        'payout',
        params,
        settings,
        (adapter, secrets) => adapter.executePayout(params, settings, secrets)
      );
    } else {
      return NextResponse.json(
        { error: `Unsupported operation action: ${type}` },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (e: any) {
    console.error('[Checkout API] Error running payment transaction', e);
    return NextResponse.json(
      { error: e.message || 'Payment execution gateway exception' },
      { status: 500 }
    );
  }
}
