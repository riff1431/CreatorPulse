import { NextResponse } from 'next/server';
import {
  getAllPromotions,
  createPromotion,
  getPromotionAnalytics,
} from '@/lib/promotions/promotions-service';

export async function GET() {
  try {
    const promotions = getAllPromotions();
    const analytics = getPromotionAnalytics();
    return NextResponse.json({
      success: true,
      promotions,
      analytics,
    });
  } catch (err: any) {
    console.error('[Promotions API] Error fetching promotions:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.code || !body.title || !body.discountType || body.discountValue === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required promotion fields (code, title, discountType, discountValue).' },
        { status: 400 }
      );
    }

    const newPromotion = createPromotion({
      code: body.code,
      title: body.title,
      description: body.description || '',
      discountType: body.discountType,
      discountValue: Number(body.discountValue),
      minPurchaseAmount: Number(body.minPurchaseAmount || 0),
      maxDiscountAmount: body.maxDiscountAmount ? Number(body.maxDiscountAmount) : undefined,
      totalUsageLimit: body.totalUsageLimit ? Number(body.totalUsageLimit) : undefined,
      perUserLimit: body.perUserLimit ? Number(body.perUserLimit) : 1,
      startDate: body.startDate || new Date().toISOString(),
      expiryDate: body.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      isAutoApplied: Boolean(body.isAutoApplied),
      scope: body.scope || 'all',
      targetCreatorId: body.targetCreatorId || undefined,
      targetCreatorName: body.targetCreatorName || undefined,
      targetPlanId: body.targetPlanId || undefined,
      targetPlanName: body.targetPlanName || undefined,
    });

    return NextResponse.json({
      success: true,
      promotion: newPromotion,
      message: `Promotion code "${newPromotion.code}" created successfully.`,
    });
  } catch (err: any) {
    console.error('[Promotions API] Error creating promotion:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create promotion' },
      { status: 400 }
    );
  }
}
