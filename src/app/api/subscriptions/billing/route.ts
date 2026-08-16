import { NextRequest, NextResponse } from 'next/server';
import {
  getSubscriptionPlans,
  saveSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriberSubscriptions,
  saveSubscriberSubscription,
  getSubscriptionAuditLogs,
  getGatewayBillingConfigs,
  saveGatewayBillingConfig,
  processFailedPaymentRetry,
  processPlanChange,
  extendGracePeriod
} from '@/lib/payments/subscription-billing-store';

export async function GET(req: NextRequest) {
  try {
    const plans = getSubscriptionPlans();
    const subscriptions = getSubscriberSubscriptions();
    const logs = getSubscriptionAuditLogs();
    const configs = getGatewayBillingConfigs();

    return NextResponse.json({
      success: true,
      plans,
      subscriptions,
      logs,
      configs
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch subscription billing data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'SAVE_PLAN': {
        const plan = saveSubscriptionPlan(body.plan);
        return NextResponse.json({ success: true, plan, message: 'Subscription plan saved successfully.' });
      }

      case 'DELETE_PLAN': {
        deleteSubscriptionPlan(body.planId);
        return NextResponse.json({ success: true, message: 'Plan deleted successfully.' });
      }

      case 'UPDATE_SUBSCRIPTION': {
        const subscription = saveSubscriberSubscription(body.subscription);
        return NextResponse.json({ success: true, subscription, message: 'Subscription updated.' });
      }

      case 'RETRY_PAYMENT': {
        const result = await processFailedPaymentRetry(body.subscriptionId);
        return NextResponse.json(result);
      }

      case 'CHANGE_PLAN': {
        const result = processPlanChange(body.subscriptionId, body.newPlanId);
        return NextResponse.json({
          success: true,
          message: `Subscription successfully switched to ${result.subscription.planName}. Net charge: $${result.proration.netCharge.toFixed(2)}`,
          ...result
        });
      }

      case 'EXTEND_GRACE': {
        const subscription = extendGracePeriod(body.subscriptionId, body.extraDays || 3);
        return NextResponse.json({
          success: true,
          subscription,
          message: `Grace period extended by ${body.extraDays || 3} days.`
        });
      }

      case 'SAVE_GATEWAY_CONFIG': {
        const config = saveGatewayBillingConfig(body.config);
        return NextResponse.json({ success: true, config, message: 'Gateway billing configuration saved.' });
      }

      default:
        return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Subscription API operation failed.' },
      { status: 500 }
    );
  }
}
