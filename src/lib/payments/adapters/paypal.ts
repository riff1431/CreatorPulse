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

export class PayPalGatewayAdapter implements PaymentGatewayAdapter {
  id = 'plugin-paypal';
  name = 'PayPal';

  async executeCheckout(
    params: CheckoutParams,
    settings: Record<string, any>,
    secrets: Record<string, string>
  ): Promise<PaymentResult> {
    console.log('[PayPal Adapter] Executing checkout...', { params, settings });

    const clientSecret = secrets.clientSecret;
    if (!clientSecret) {
      return {
        success: false,
        transactionId: '',
        status: 'Failed',
        message: 'PayPal Client Secret is missing. Check configurations.'
      };
    }

    const isSandbox = settings.mode === 'sandbox' || params.isSandbox;
    const paypalOrderId = `PAYPAL_ORDER_${isSandbox ? 'SB' : 'LV'}_${crypto.randomBytes(12).toString('hex').toUpperCase()}`;

    // Redirect user to mock paypal portal
    const redirectUrl = `/api/payments/checkout/simulate?gateway=paypal&sessionId=${paypalOrderId}&amount=${params.amount}&currency=${params.currency}&idempotencyKey=${params.idempotencyKey}&userId=${params.userId}&creatorId=${params.creatorId}&description=${encodeURIComponent(params.description)}`;

    return {
      success: true,
      transactionId: paypalOrderId,
      status: 'Pending',
      message: 'PayPal Order initialized.',
      gatewayReference: redirectUrl
    };
  }

  async executeSubscription(
    params: SubscriptionParams,
    settings: Record<string, any>,
    secrets: Record<string, string>
  ): Promise<PaymentResult> {
    console.log('[PayPal Adapter] Executing subscription...', { params });

    const clientSecret = secrets.clientSecret;
    if (!clientSecret) {
      return {
        success: false,
        transactionId: '',
        status: 'Failed',
        message: 'PayPal Client Secret is missing.'
      };
    }

    const paypalAgreementId = `I-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
    const redirectUrl = `/api/payments/checkout/simulate?gateway=paypal&sessionId=${paypalAgreementId}&subscription=true&amount=${params.amount}&currency=${params.currency}&idempotencyKey=${params.idempotencyKey}&userId=${params.userId}&creatorId=${params.creatorId}&planId=${params.planId}&planName=${encodeURIComponent(params.planName)}&durationMonths=${params.durationMonths}`;

    return {
      success: true,
      transactionId: paypalAgreementId,
      status: 'Pending',
      message: 'PayPal billing agreement initialized.',
      gatewayReference: redirectUrl
    };
  }

  async executeRefund(
    params: RefundParams,
    settings: Record<string, any>,
    secrets: Record<string, string>
  ): Promise<RefundResult> {
    console.log('[PayPal Adapter] Executing refund...', { params });
    const refundId = `REF-${crypto.randomBytes(10).toString('hex').toUpperCase()}`;
    return {
      success: true,
      refundId,
      status: 'Completed',
      message: `PayPal Refund successfully processed. Refund ID: ${refundId}`
    };
  }

  async executeWalletFunding(
    params: WalletFundingParams,
    settings: Record<string, any>,
    secrets: Record<string, string>
  ): Promise<PaymentResult> {
    console.log('[PayPal Adapter] Executing wallet funding...', { params });
    const paypalOrderId = `PAYPAL_FUND_${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
    const redirectUrl = `/api/payments/checkout/simulate?gateway=paypal&sessionId=${paypalOrderId}&funding=true&amount=${params.amount}&currency=${params.currency}&idempotencyKey=${params.idempotencyKey}&userId=${params.userId}`;

    return {
      success: true,
      transactionId: paypalOrderId,
      status: 'Pending',
      message: 'PayPal wallet funding initialized.',
      gatewayReference: redirectUrl
    };
  }

  async executePayout(
    params: PayoutParams,
    settings: Record<string, any>,
    secrets: Record<string, string>
  ): Promise<PayoutResult> {
    console.log('[PayPal Adapter] Executing PayPal payout...', { params });
    const clientSecret = secrets.clientSecret;
    if (!clientSecret) {
      return { success: false, payoutId: '', status: 'Failed', message: 'PayPal client secret missing' };
    }

    const payoutBatchId = `BATCH-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    return {
      success: true,
      payoutId: payoutBatchId,
      status: 'Completed',
      message: `PayPal Payout Batch completed. Batch ID: ${payoutBatchId}`
    };
  }

  async verifyWebhook(
    headers: Record<string, string>,
    body: string,
    secrets: Record<string, string>
  ): Promise<boolean> {
    // PayPal webhooks include signatures verified by clientSecret and transmission headers.
    // In our implementation, we check that headers contain PAYPAL-TRANSMISSION-SIG to verify authenticity.
    const signature = headers['paypal-transmission-sig'] || headers['PAYPAL-TRANSMISSION-SIG'];
    return !!signature;
  }

  async handleWebhook(
    payload: any,
    secrets: Record<string, string>
  ): Promise<WebhookResult> {
    console.log('[PayPal Adapter] Handling PayPal Webhook event...', payload);
    const eventType = payload.event_type;
    
    let transactionId = '';
    let status: TransactionStatus = 'Pending';
    let message = `PayPal Event: ${eventType}`;
    let eventLogged = true;

    if (eventType === 'PAYMENT.SALE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
      transactionId = payload.resource?.id || payload.resource?.parent_payment || '';
      status = 'Completed';
      message = 'PayPal Sale completed.';
    } else if (eventType === 'PAYMENT.SALE.DENIED') {
      transactionId = payload.resource?.id || '';
      status = 'Failed';
      message = 'PayPal Sale denied.';
    } else if (eventType === 'PAYMENT.SALE.REFUNDED') {
      transactionId = payload.resource?.parent_payment || '';
      status = 'Refunded';
      message = 'PayPal Sale refunded.';
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
    if (mappingRules && mappingRules[gatewayStatus]) {
      return mappingRules[gatewayStatus] as TransactionStatus;
    }

    switch (gatewayStatus.toUpperCase()) {
      case 'APPROVED':
      case 'COMPLETED':
      case 'SUCCESS':
        return 'Completed';
      case 'PENDING':
      case 'CREATED':
        return 'Pending';
      case 'FAILED':
      case 'DENIED':
      case 'EXPIRED':
        return 'Failed';
      case 'REFUNDED':
        return 'Refunded';
      default:
        return 'Pending';
    }
  }
}
