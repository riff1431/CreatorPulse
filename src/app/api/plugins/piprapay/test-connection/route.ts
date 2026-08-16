import { NextResponse } from 'next/server';
import { PipraPayService } from '@plugins/piprapay/services/piprapay.service';
import { getSecrets } from '@/lib/payments/secrets-vault';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const settings = body.settings || {};
    const secrets = getSecrets('plugin-piprapay');

    const result = await PipraPayService.testConnection(settings, secrets);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      latencyMs: result.latencyMs,
      mode: result.mode,
      statusCode: result.statusCode
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Connection test failed' },
      { status: 500 }
    );
  }
}
