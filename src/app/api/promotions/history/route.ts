import { NextResponse } from 'next/server';
import { getRedemptionHistory, getPromotionAnalytics } from '@/lib/promotions/promotions-service';

export async function GET() {
  try {
    const history = getRedemptionHistory();
    const analytics = getPromotionAnalytics();
    return NextResponse.json({
      success: true,
      history,
      analytics,
    });
  } catch (err: any) {
    console.error('[Promotions History API] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch coupon history' },
      { status: 500 }
    );
  }
}
