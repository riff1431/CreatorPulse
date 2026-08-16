import { NextResponse } from 'next/server';
import { getCheckoutConfig, saveCheckoutConfig, resetCheckoutConfig } from '@/lib/payments/checkout-config-store';

export async function GET() {
  try {
    const config = getCheckoutConfig();
    return NextResponse.json({
      success: true,
      config
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load checkout settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'reset') {
      const resetConfig = resetCheckoutConfig();
      return NextResponse.json({
        success: true,
        message: 'Checkout settings reset to defaults',
        config: resetConfig
      });
    }

    const updatedConfig = saveCheckoutConfig(body.config || {});
    return NextResponse.json({
      success: true,
      message: 'Checkout settings saved successfully',
      config: updatedConfig
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save checkout settings' },
      { status: 500 }
    );
  }
}
