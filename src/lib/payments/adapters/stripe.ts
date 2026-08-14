import crypto from 'crypto';
import {
  PaymentGatewayAdapter,
  CheckoutParams,
  SubscriptionParams,
  RefundParams,
  WalletFundingParams,
  PayoutParams,
  PaymentResult,
  RefundResult,
  PayoutResult,
  WebhookResult,
  TransactionStatus
} from '../types';

export class StripeGatewayAdapter implements PaymentGatewayAdapter {
  id = 'plugin-stripe';
  name = 'Stripe';

  async executeCheckout(
    params: CheckoutParams,
    settings: Record<string, any>,
    secrets: Record<string, string>
  ): Promise<PaymentResult> {
    console.log('[Stripe Adapter] Executing checkout...', { params, settings });
    
    // Check credentials
    const secretKey = secrets.secretKey;
    if (!secretKey) {
      return {
        success: false,
        transactionId: '',
        status: 'Failed',
        message: 'Stripe Secret API Key is missing. Check configurations.'
      };
    }

    const isSandbox = settings.mode === 'sandbox' || params.isSandbox;
    const stripeSessionId = `cs_${isSandbox ? 'test' : 'live'}_${crypto.randomBytes(16).toString('hex')}`;
    
    // Return checkout session URL for mock stripe payment portal
    const redirectUrl = `/api/payments/checkout/simulate?gateway=stripe&sessionId=${stripeSessionId}&amount=${params.amount}&currency=${params.currency}&idempotencyKey=${params.idempotencyKey}&userId=${params.userId}&creatorId=${params.creatorId}&description=${encodeURIComponent(params.description)}`;

    return {
      success: true,
      transactionId: stripeSessionId,
      status: 'Pending',
      message: 'Stripe checkout session initialized.',
      gatewayReference: redirectUrl // Core app can use this to redirect the user
    };
  }

  async executeSubscription(
    params: SubscriptionParams,
    settings: Record<string, any>,
    secrets: Record<string, string>
  ): Promise<PaymentResult> {
    console.log('[Stripe Adapter] Creating subscription...', { params, settings });
    const secretKey = secrets.secretKey;
    if (!secretKey) {
      return {
        success: false,
        transactionId: '',
        status: 'Failed',
        message: 'Stripe Secret API Key is missing.'
      };
    }

    // In a live system this makes a call to stripe: stripe.subscriptions.create()
    const stripeSubId = `sub_${settings.mode === 'sandbox' ? 'test' : 'live'}_${crypto.randomBytes(16).toString('hex')}`;
    const redirectUrl = `/api/payments/checkout/simulate?gateway=stripe&sessionId=${stripeSubId}&subscription=true&amount=${params.amount}&currency=${params.currency}&idempotencyKey=${params.idempotencyKey}&userId=${params.userId}&creatorId=${params.creatorId}&planId=${params.planId}&planName=${encodeURIComponent(params.planName)}&durationMonths=${params.durationMonths}`;

    return {
      success: true,
      transactionId: stripeSubId,
      status: 'Pending',
      message: 'Stripe subscription checkout initialized.',
      gatewayReference: redirectUrl
    };
  }

  async executeRefund(
    params: RefundParams,
    settings: Record<string, any>,
    secrets: Record<string, string>
  ): Promise<RefundResult> {
    console.log('[Stripe Adapter] Refunding transaction...', { params });
    const secretKey = secrets.secretKey;
    if (!secretKey) {
      return { success: false, refundId: '', status: 'Failed', message: 'Stripe secret key missing' };
    }

    const stripeRefundId = `re_${crypto.randomBytes(12).toString('hex')}`;
    return {
      success: true,
      refundId: stripeRefundId,
      status: 'Completed',
      message: `Stripe charge refunded. Stripe ID: ${stripeRefundId}`,
      rawResponse: { refundId: stripeRefundId, status: 'succeeded' }
    };
  }

  async executeWalletFunding(
    params: WalletFundingParams,
    settings: Record<string, any>,
    secrets: Record<string, string>
  ): Promise<PaymentResult> {
    console.log('[Stripe Adapter] Processing wallet funding...', { params });
    const stripeSessionId = `cs_test_funding_${crypto.randomBytes(16).toString('hex')}`;
    const redirectUrl = `/api/payments/checkout/simulate?gateway=stripe&sessionId=${stripeSessionId}&funding=true&amount=${params.amount}&currency=${params.currency}&idempotencyKey=${params.idempotencyKey}&userId=${params.userId}`;

    return {
      success: true,
      transactionId: stripeSessionId,
      status: 'Pending',
      message: 'Stripe wallet funding session initialized.',
      gatewayReference: redirectUrl
    };
  }

  async executePayout(
    params: PayoutParams,
    settings: Record<string, any>,
    secrets: Record<string, string>
  ): Promise<PayoutResult> {
    console.log('[Stripe Adapter] Creating payout transfer...', { params });
    const secretKey = secrets.secretKey;
    if (!secretKey) {
      return { success: false, payoutId: '', status: 'Failed', message: 'Stripe secret key missing' };
    }

    const stripeTransferId = `tr_${crypto.randomBytes(12).toString('hex')}`;
    return {
      success: true,
      payoutId: stripeTransferId,
      status: 'Completed',
      message: `Stripe Connect payout transfer completed. Transfer ID: ${stripeTransferId}`
    };
  }

  async verifyWebhook(
    headers: Record<string, string>,
    body: string,
    secrets: Record<string, string>
  ): Promise<boolean> {
    const signatureHeader = headers['stripe-signature'];
    const webhookSecret = secrets.webhookSecret;
    if (!signatureHeader || !webhookSecret) return false;

    try {
      // Parse stripe-signature header: t=1492774577,v1=5257a869e3ece...
      const parts = signatureHeader.split(',');
      let timestamp = '';
      const signatures: string[] = [];

      for (const part of parts) {
        const [key, val] = part.split('=');
        if (key === 't') timestamp = val;
        if (key === 'v1') signatures.push(val);
      }

      if (!timestamp || signatures.length === 0) return false;

      // Construct signed payload: t.body
      const signedPayload = `${timestamp}.${body}`;
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload)
        .digest('hex');

      return signatures.includes(expectedSignature);
    } catch (e) {
      console.error('[Stripe Adapter] Webhook verification error', e);
      return false;
    }
  }

  async handleWebhook(
    payload: any,
    secrets: Record<string, string>
  ): Promise<WebhookResult> {
    console.log('[Stripe Adapter] Handling Stripe Webhook payload...', payload);
    const eventType = payload.type;
    
    let transactionId = '';
    let status: TransactionStatus = 'Pending';
    let message = `Stripe Event: ${eventType}`;
    let eventLogged = true;

    if (eventType === 'checkout.session.completed' || eventType === 'payment_intent.succeeded') {
      const session = payload.data?.object;
      transactionId = session?.id || session?.payment_intent || '';
      status = 'Completed';
      message = 'Stripe Payment succeeded.';
    } else if (eventType === 'payment_intent.payment_failed') {
      const intent = payload.data?.object;
      transactionId = intent?.id || '';
      status = 'Failed';
      message = `Stripe Payment failed: ${intent?.last_payment_error?.message || 'unknown error'}`;
    } else if (eventType === 'charge.refunded') {
      const charge = payload.data?.object;
      transactionId = charge?.payment_intent || '';
      status = 'Refunded';
      message = 'Stripe charge refunded.';
    }

    return {
      handled: true,
      transactionId,
      status,
      message,
      eventLogged
    };
  }

  mapStatus(gatewayStatus: string, mappingRules?: Record<string, string>): TransactionStatus {
    // Check custom mappings if provided
    if (mappingRules && mappingRules[gatewayStatus]) {
      return mappingRules[gatewayStatus] as TransactionStatus;
    }

    switch (gatewayStatus) {
      case 'succeeded':
      case 'paid':
      case 'active':
      case 'completed':
        return 'Completed';
      case 'requires_payment_method':
      case 'requires_action':
      case 'processing':
      case 'incomplete':
        return 'Pending';
      case 'failed':
      case 'canceled':
      case 'incomplete_expired':
      case 'unpaid':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      default:
        return 'Pending';
    }
  }
}
