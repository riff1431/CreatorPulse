export type TransactionStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

export interface CheckoutParams {
  idempotencyKey: string;
  userId: string;
  creatorId: string;
  amount: number;
  currency: string;
  description: string;
  isSandbox: boolean;
  metadata?: Record<string, any>;
}

export interface SubscriptionParams {
  idempotencyKey: string;
  userId: string;
  creatorId: string;
  planId: string;
  planName: string;
  durationMonths: number;
  amount: number;
  currency: string;
  autoRenew: boolean;
  isSandbox: boolean;
}

export interface RefundParams {
  transactionId: string;
  amount: number;
  reason: string;
  isSandbox: boolean;
}

export interface WalletFundingParams {
  idempotencyKey: string;
  userId: string;
  amount: number;
  currency: string;
  isSandbox: boolean;
}

export interface PayoutParams {
  idempotencyKey: string;
  creatorId: string;
  amount: number;
  currency: string;
  method: string;
  accountDetails: string;
  isSandbox: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: TransactionStatus;
  message: string;
  gatewayReference?: string;
  rawResponse?: any;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  status: 'Completed' | 'Failed';
  message: string;
  rawResponse?: any;
}

export interface PayoutResult {
  success: boolean;
  payoutId: string;
  status: 'Pending' | 'Completed' | 'Failed';
  message: string;
  rawResponse?: any;
}

export interface WebhookResult {
  handled: boolean;
  transactionId?: string;
  status?: TransactionStatus;
  message: string;
  eventLogged?: boolean;
}

export interface PaymentGatewayAdapter {
  id: string; // e.g. 'plugin-stripe', 'plugin-paypal', 'plugin-mock'
  name: string;
  
  executeCheckout(
    params: CheckoutParams, 
    settings: Record<string, any>, 
    secrets: Record<string, string>
  ): Promise<PaymentResult>;

  executeSubscription(
    params: SubscriptionParams, 
    settings: Record<string, any>, 
    secrets: Record<string, string>
  ): Promise<PaymentResult>;

  executeRefund(
    params: RefundParams, 
    settings: Record<string, any>, 
    secrets: Record<string, string>
  ): Promise<RefundResult>;

  executeWalletFunding(
    params: WalletFundingParams, 
    settings: Record<string, any>, 
    secrets: Record<string, string>
  ): Promise<PaymentResult>;

  executePayout(
    params: PayoutParams, 
    settings: Record<string, any>, 
    secrets: Record<string, string>
  ): Promise<PayoutResult>;

  verifyWebhook(
    headers: Record<string, string>, 
    body: string, 
    secrets: Record<string, string>
  ): Promise<boolean>;

  handleWebhook(
    payload: any, 
    secrets: Record<string, string>
  ): Promise<WebhookResult>;

  mapStatus(gatewayStatus: string, mappingRules?: Record<string, string>): TransactionStatus;
}
