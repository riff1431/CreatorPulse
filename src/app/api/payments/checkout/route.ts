import { NextResponse } from 'next/server';
import { executeGatewayOperation } from '@/lib/payments/payment-service';
import { validateCoupon, recordCouponRedemption } from '@/lib/promotions/promotions-service';

export async function POST(req: Request) {
  try {
    const { gatewayId, type, params, settings, appliedCouponCode, checkAutoApply } = await req.json();

    if (!gatewayId || !type || !params || !settings) {
      return NextResponse.json(
        { error: 'Missing required request fields: gatewayId, type, params, or settings.' },
        { status: 400 }
      );
    }

    // Process & validate promotions server-side if coupon code or auto-apply is specified
    let validatedCouponId: string | undefined;
    let originalAmount = params.amount;
    let finalAmount = params.amount;
    let discountAmount = 0;

    if (appliedCouponCode || checkAutoApply) {
      const promoResult = validateCoupon({
        code: appliedCouponCode,
        amount: originalAmount,
        userId: params.userId,
        creatorId: params.creatorId,
        planId: params.planId,
        checkAutoApply: Boolean(checkAutoApply),
      });

      if (promoResult.valid && promoResult.coupon) {
        validatedCouponId = promoResult.coupon.id;
        discountAmount = promoResult.discountAmount;
        finalAmount = promoResult.finalAmount;
        // Override params amount passed to payment gateway with discounted final amount
        params.amount = finalAmount;
        params.discountAmount = discountAmount;
        params.appliedCouponCode = promoResult.coupon.code;
      } else if (appliedCouponCode) {
        // Explicit code entered but invalid
        return NextResponse.json(
          { error: promoResult.message },
          { status: 400 }
        );
      }
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

    // If transaction succeeded and a coupon was validated, record redemption
    if (result && result.success && validatedCouponId) {
      try {
        recordCouponRedemption({
          couponId: validatedCouponId,
          userId: params.userId || 'user-member',
          userName: params.userName || 'Alex Vance',
          originalAmount,
          discountAmount,
          finalAmount,
          gatewayId,
          transactionId: (result as any).transactionId || `tx-${Date.now()}`,
          creatorId: params.creatorId,
          creatorName: params.creatorName,
          planId: params.planId,
          planName: params.planName,
        });
      } catch (logErr) {
        console.error('[Checkout API] Error recording coupon redemption:', logErr);
      }
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
