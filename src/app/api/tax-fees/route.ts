import { NextRequest, NextResponse } from 'next/server';
import {
  getTaxRules,
  saveTaxRule,
  deleteTaxRule,
  getPlatformFeeConfig,
  savePlatformFeeConfig,
  getGatewayProcessingFees,
  saveGatewayProcessingFee,
  calculateTaxAndFees
} from '@/lib/payments/tax-fee-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const baseAmount = searchParams.get('amount');

    if (baseAmount) {
      const calculation = calculateTaxAndFees({
        baseAmount: parseFloat(baseAmount) || 0,
        currency: searchParams.get('currency') || 'USD',
        countryCode: searchParams.get('country') || 'US',
        paymentType: (searchParams.get('type') as any) || 'checkout',
        gatewayId: searchParams.get('gateway') || 'plugin-mock',
        creatorTierLevel: parseInt(searchParams.get('tier') || '1')
      });
      return NextResponse.json({ success: true, calculation });
    }

    const rules = getTaxRules();
    const platformConfig = getPlatformFeeConfig();
    const gatewayFees = getGatewayProcessingFees();

    return NextResponse.json({
      success: true,
      rules,
      platformConfig,
      gatewayFees
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch tax and fee data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'CALCULATE': {
        const calculation = calculateTaxAndFees(body);
        return NextResponse.json({ success: true, calculation });
      }

      case 'SAVE_TAX_RULE': {
        const rule = saveTaxRule(body.rule);
        return NextResponse.json({ success: true, rule, message: 'Tax rule saved successfully.' });
      }

      case 'DELETE_TAX_RULE': {
        deleteTaxRule(body.ruleId);
        return NextResponse.json({ success: true, message: 'Tax rule deleted.' });
      }

      case 'SAVE_PLATFORM_FEE_CONFIG': {
        const config = savePlatformFeeConfig(body.config);
        return NextResponse.json({ success: true, config, message: 'Platform fee configuration updated.' });
      }

      case 'SAVE_GATEWAY_FEE': {
        const fee = saveGatewayProcessingFee(body.fee);
        return NextResponse.json({ success: true, fee, message: 'Gateway processing fee updated.' });
      }

      default:
        return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Tax & fee operation failed.' },
      { status: 500 }
    );
  }
}
