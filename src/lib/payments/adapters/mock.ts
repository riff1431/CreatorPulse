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

export class MockGatewayAdapter implements PaymentGatewayAdapter {
  id = 'plugin-mock';
  name = 'Developer Sandbox';

  async executeCheckout(
    params: CheckoutParams,
    settings: Record<string, any>,
    secrets: Record<string, string>
  ): Promise<PaymentResult> {
    console.log('[Mock Gateway] Processing checkout...', params);
    
    // Simulate slight delay
    await new Promise((r) => setTimeout(r, 400));

    // Allow failure simulation via a specific amount (e.g. $99.99)
    if (params.amount === 99.99) {
      return {
        success: false,
        transactionId: `mock-tx-${Date.now()}`,
        status: 'Failed',
        message: 'Insufficient funds (Simulated Sandbox Error).'
      };
    }

    return {
      success: true,
      transactionId: `mock-tx-${Date.now()}`,
      status: 'Completed',
      message: 'Transaction completed successfully via Developer Sandbox.',
      gatewayReference: `ch_mock_${Math.random().toString(36).substring(2, 10)}`,
      rawResponse: {
        gateway: 'plugin-mock',
        timestamp: new Date().toISOString(),
        mode: 'sandbox',
        amount: params.amount,
        currency: params.currency
      }
    };
  }

  async executeSubscription(
    params: SubscriptionParams,
    settings: Record<string, any>,
    secrets: Record<string, string>
  ): Promise<PaymentResult> {
    console.log('[Mock Gateway] Processing subscription...', params);
    await new Promise((r) => setTimeout(r, 400));

    return {
      success: true,
      transactionId: `mock-tx-${Date.now()}`,
      status: 'Completed',
      message: `Successfully subscribed to plan "${params.planName}" via Developer Sandbox.`,
      gatewayReference: `sub_mock_${Math.random().toString(36).substring(2, 10)}`,
      rawResponse: {
        subscriptionId: `sub_mock_${Date.now()}`,
        autoRenew: params.autoRenew,
        durationMonths: params.durationMonths
      }
    };
  }

  async executeRefund(
    params: RefundParams,
    settings: Record<string, any>,
    secrets: Record<string, string>
  ): Promise<RefundResult> {
    console.log('[Mock Gateway] Processing refund...', params);
    await new Promise((r) => setTimeout(r, 300));

    return {
      success: true,
      refundId: `mock-ref-${Date.now()}`,
      status: 'Completed',
      message: `Successfully refunded $${params.amount.toFixed(2)} for transaction ${params.transactionId}.`
    };
  }

  async executeWalletFunding(
    params: WalletFundingParams,
    settings: Record<string, any>,
    secrets: Record<string, string>
  ): Promise<PaymentResult> {
    console.log('[Mock Gateway] Processing wallet funding...', params);
    await new Promise((r) => setTimeout(r, 300));

    return {
      success: true,
      transactionId: `mock-tx-${Date.now()}`,
      status: 'Completed',
      message: `Wallet funded with $${params.amount.toFixed(2)} via Developer Sandbox.`,
      gatewayReference: `funding_mock_${Math.random().toString(36).substring(2, 10)}`
    };
  }

  async executePayout(
    params: PayoutParams,
    settings: Record<string, any>,
    secrets: Record<string, string>
  ): Promise<PayoutResult> {
    console.log('[Mock Gateway] Processing payout...', params);
    await new Promise((r) => setTimeout(r, 400));

    return {
      success: true,
      payoutId: `mock-pay-${Date.now()}`,
      status: 'Completed',
      message: `Payout of $${params.amount.toFixed(2)} successfully sent to account details via Sandbox.`
    };
  }

  async verifyWebhook(
    headers: Record<string, string>,
    body: string,
    secrets: Record<string, string>
  ): Promise<boolean> {
    // Sandbox webhook requires a mock signature check or defaults to true
    return headers['x-mock-signature'] === 'mock-sandbox-signature-ok' || headers['x-mock-signature'] !== undefined;
  }

  async handleWebhook(
    payload: any,
    secrets: Record<string, string>
  ): Promise<WebhookResult> {
    console.log('[Mock Gateway] Handling webhook payload...', payload);
    return {
      handled: true,
      transactionId: payload.txId || `mock-tx-${Date.now()}`,
      status: (payload.status as TransactionStatus) || 'Completed',
      message: 'Mock webhook event processed successfully.',
      eventLogged: true
    };
  }

  mapStatus(gatewayStatus: string, mappingRules?: Record<string, string>): TransactionStatus {
    if (mappingRules && mappingRules[gatewayStatus]) {
      return mappingRules[gatewayStatus] as TransactionStatus;
    }
    switch (gatewayStatus.toLowerCase()) {
      case 'success':
      case 'succeeded':
      case 'completed':
        return 'Completed';
      case 'failed':
      case 'error':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      case 'pending':
      default:
        return 'Pending';
    }
  }
}
