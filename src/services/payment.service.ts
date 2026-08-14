import { CheckoutParams } from '@/lib/payments/types';
import { APP_CONFIG } from '@/config/app.config';

export class PaymentService {
  static calculatePlatformFee(amountUsd: number): { netAmount: number; platformFee: number } {
    const feeRate = APP_CONFIG.monetization.platformFeePercentage / 100;
    const platformFee = Math.round(amountUsd * feeRate * 100) / 100;
    const netAmount = Math.round((amountUsd - platformFee) * 100) / 100;
    return { netAmount, platformFee };
  }

  static getSupportedGateways(): { id: string; name: string; isLive: boolean }[] {
    return [
      { id: 'plugin-stripe', name: 'Stripe (Cards & Apple Pay)', isLive: true },
      { id: 'plugin-paypal', name: 'PayPal & Pay in 4', isLive: true },
      { id: 'plugin-crypto', name: 'Cryptocurrency (USDC / SOL)', isLive: true },
      { id: 'plugin-mock', name: 'Simulator / Test Gateway', isLive: true },
    ];
  }

  static validateCheckoutSession(params: Partial<CheckoutParams>): { isValid: boolean; error?: string } {
    if (!params.amount || params.amount <= 0) {
      return { isValid: false, error: 'Checkout amount must be greater than 0' };
    }
    if (!params.creatorId) {
      return { isValid: false, error: 'Missing required creator recipient identifier' };
    }
    return { isValid: true };
  }
}
