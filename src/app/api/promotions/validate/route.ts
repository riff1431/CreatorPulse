import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/promotions/promotions-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, amount, userId, creatorId, planId, checkAutoApply } = body;

    if (amount === undefined || isNaN(Number(amount))) {
      return NextResponse.json(
        { valid: false, message: 'Valid amount is required for validation.' },
        { status: 400 }
      );
    }

    const validationResult = validateCoupon({
      code: code ? String(code) : undefined,
      amount: Number(amount),
      userId: userId ? String(userId) : undefined,
      creatorId: creatorId ? String(creatorId) : undefined,
      planId: planId ? String(planId) : undefined,
      checkAutoApply: Boolean(checkAutoApply),
    });

    return NextResponse.json(validationResult);
  } catch (err: any) {
    console.error('[Promotions Validate API] Error validating coupon:', err);
    return NextResponse.json(
      { valid: false, message: err.message || 'Validation server exception.' },
      { status: 500 }
    );
  }
}
