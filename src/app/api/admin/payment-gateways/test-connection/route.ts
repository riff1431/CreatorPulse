import { NextResponse } from 'next/server';
import { testGatewayConnection } from '@/lib/payments/payment-service';

export async function POST(req: Request) {
  try {
    const { gatewayId, settings } = await req.json();

    if (!gatewayId) {
      return NextResponse.json(
        { success: false, error: 'Gateway ID is required for diagnostics' },
        { status: 400 }
      );
    }

    const result = await testGatewayConnection(gatewayId, settings || {});

    return NextResponse.json({
      success: result.success,
      message: result.message,
      latencyMs: result.latencyMs,
      mode: result.mode
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Diagnostic connection test failed' },
      { status: 500 }
    );
  }
}
