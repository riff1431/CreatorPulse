export type PaymentType = 'subscription' | 'checkout' | 'tip' | 'wallet_funding';
export type ChargeModel = 'pass_to_buyer' | 'absorb_by_platform' | 'deduct_from_creator';

export interface CountryTaxRule {
  id: string;
  countryCode: string; // e.g. "US", "EU", "GB", "CA", "AU", "BD", "GLOBAL"
  countryName: string;
  taxName: string; // e.g. "VAT", "GST", "State Sales Tax", "Standard Tax"
  taxRate: number; // percentage, e.g. 20.0 for 20%
  isInclusive: boolean; // true if tax is included in price, false if added on top
  appliedPaymentTypes: PaymentType[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TierFeeOverride {
  tierLevel: number;
  tierName: string;
  platformFeePercentage: number;
}

export interface PlatformFeeConfig {
  defaultPlatformFeePercentage: number; // e.g. 5.0
  fixedFeeAmount: number; // e.g. 0.30
  minimumFeeAmount: number; // e.g. 0.50
  creatorCommissionPercentage: number; // e.g. 95.0
  tierOverrides: TierFeeOverride[];
  updatedAt: string;
}

export interface GatewayProcessingFee {
  gatewayId: string;
  gatewayName: string;
  percentageFee: number; // e.g. 2.9
  fixedFee: number; // e.g. 0.30
  chargeModel: ChargeModel;
  isActive: boolean;
  updatedAt: string;
}

export interface TaxFeeCalculateParams {
  baseAmount: number;
  currency?: string;
  countryCode?: string;
  paymentType?: PaymentType;
  gatewayId?: string;
  creatorTierLevel?: number;
}

export interface TaxFeeCalculationResult {
  baseAmount: number;
  currency: string;
  countryCode: string;
  paymentType: PaymentType;
  gatewayId: string;
  taxRuleName: string;
  taxRate: number;
  isInclusiveTax: boolean;
  taxAmount: number;
  platformFeeRate: number;
  platformFeeAmount: number;
  gatewayProcessingFee: number;
  chargeModel: ChargeModel;
  creatorNetEarning: number;
  buyerTotal: number;
}

const STORAGE_TAX_RULES_KEY = 'creatorpulse_tax_rules';
const STORAGE_PLATFORM_FEE_KEY = 'creatorpulse_platform_fee_config';
const STORAGE_GATEWAY_FEES_KEY = 'creatorpulse_gateway_processing_fees';

// Default initial Tax Rules
export const DEFAULT_TAX_RULES: CountryTaxRule[] = [
  {
    id: 'tax-us',
    countryCode: 'US',
    countryName: 'United States',
    taxName: 'State Sales Tax',
    taxRate: 8.0,
    isInclusive: false,
    appliedPaymentTypes: ['subscription', 'checkout', 'tip', 'wallet_funding'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'tax-eu',
    countryCode: 'EU',
    countryName: 'European Union (VAT)',
    taxName: 'EU Value Added Tax (VAT)',
    taxRate: 20.0,
    isInclusive: true,
    appliedPaymentTypes: ['subscription', 'checkout', 'tip', 'wallet_funding'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'tax-gb',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    taxName: 'UK VAT',
    taxRate: 20.0,
    isInclusive: true,
    appliedPaymentTypes: ['subscription', 'checkout', 'tip', 'wallet_funding'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'tax-ca',
    countryCode: 'CA',
    countryName: 'Canada',
    taxName: 'HST / GST',
    taxRate: 13.0,
    isInclusive: false,
    appliedPaymentTypes: ['subscription', 'checkout', 'tip'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'tax-au',
    countryCode: 'AU',
    countryName: 'Australia',
    taxName: 'GST',
    taxRate: 10.0,
    isInclusive: true,
    appliedPaymentTypes: ['subscription', 'checkout', 'tip', 'wallet_funding'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'tax-bd',
    countryCode: 'BD',
    countryName: 'Bangladesh',
    taxName: 'VAT',
    taxRate: 5.0,
    isInclusive: false,
    appliedPaymentTypes: ['subscription', 'checkout', 'tip', 'wallet_funding'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'tax-global',
    countryCode: 'GLOBAL',
    countryName: 'Global / Standard Fallback',
    taxName: 'Standard Platform Tax',
    taxRate: 5.0,
    isInclusive: false,
    appliedPaymentTypes: ['subscription', 'checkout', 'tip', 'wallet_funding'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  }
];

// Default Platform Fee Config
export const DEFAULT_PLATFORM_FEE_CONFIG: PlatformFeeConfig = {
  defaultPlatformFeePercentage: 5.0,
  fixedFeeAmount: 0.30,
  minimumFeeAmount: 0.50,
  creatorCommissionPercentage: 95.0,
  tierOverrides: [
    { tierLevel: 1, tierName: 'Starter Community Tier', platformFeePercentage: 10.0 },
    { tierLevel: 2, tierName: 'Pro Creator Tier', platformFeePercentage: 7.5 },
    { tierLevel: 3, tierName: 'VIP Inner Circle', platformFeePercentage: 5.0 }
  ],
  updatedAt: '2026-08-01T00:00:00.000Z'
};

// Default Gateway Processing Fees
export const DEFAULT_GATEWAY_PROCESSING_FEES: GatewayProcessingFee[] = [
  {
    gatewayId: 'plugin-stripe',
    gatewayName: 'Stripe Payments',
    percentageFee: 2.9,
    fixedFee: 0.30,
    chargeModel: 'pass_to_buyer',
    isActive: true,
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    gatewayId: 'plugin-paypal',
    gatewayName: 'PayPal Commerce',
    percentageFee: 3.49,
    fixedFee: 0.49,
    chargeModel: 'pass_to_buyer',
    isActive: true,
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    gatewayId: 'plugin-piprapay',
    gatewayName: 'PipraPay Gateway',
    percentageFee: 1.5,
    fixedFee: 0.0,
    chargeModel: 'absorb_by_platform',
    isActive: true,
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    gatewayId: 'plugin-mock',
    gatewayName: 'Mock Sandbox Gateway',
    percentageFee: 0.0,
    fixedFee: 0.0,
    chargeModel: 'absorb_by_platform',
    isActive: true,
    updatedAt: '2026-08-01T00:00:00.000Z'
  }
];

function notifyTaxFeeStoreChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('creatorpulse_tax_fees_updated'));
  }
}

// Tax Rules Store
export function getTaxRules(): CountryTaxRule[] {
  if (typeof window === 'undefined') return DEFAULT_TAX_RULES;
  try {
    const raw = localStorage.getItem(STORAGE_TAX_RULES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_TAX_RULES_KEY, JSON.stringify(DEFAULT_TAX_RULES));
      return DEFAULT_TAX_RULES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TAX_RULES;
  }
}

export function saveTaxRule(rule: Partial<CountryTaxRule>): CountryTaxRule {
  const rules = getTaxRules();
  const now = new Date().toISOString();

  let updated: CountryTaxRule;
  if (rule.id) {
    const idx = rules.findIndex((r) => r.id === rule.id);
    if (idx !== -1) {
      updated = { ...rules[idx], ...rule, updatedAt: now };
      rules[idx] = updated;
    } else {
      updated = {
        id: rule.id,
        countryCode: rule.countryCode || 'GLOBAL',
        countryName: rule.countryName || 'Global',
        taxName: rule.taxName || 'Tax',
        taxRate: rule.taxRate ?? 5.0,
        isInclusive: rule.isInclusive ?? false,
        appliedPaymentTypes: rule.appliedPaymentTypes || ['subscription', 'checkout', 'tip', 'wallet_funding'],
        isActive: rule.isActive ?? true,
        createdAt: now,
        updatedAt: now
      };
      rules.unshift(updated);
    }
  } else {
    updated = {
      id: `tax-${Date.now()}`,
      countryCode: (rule.countryCode || 'GLOBAL').toUpperCase(),
      countryName: rule.countryName || 'New Region',
      taxName: rule.taxName || 'Tax',
      taxRate: rule.taxRate ?? 5.0,
      isInclusive: rule.isInclusive ?? false,
      appliedPaymentTypes: rule.appliedPaymentTypes || ['subscription', 'checkout', 'tip', 'wallet_funding'],
      isActive: rule.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    rules.unshift(updated);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_TAX_RULES_KEY, JSON.stringify(rules));
    notifyTaxFeeStoreChanged();
  }
  return updated;
}

export function deleteTaxRule(ruleId: string): boolean {
  const rules = getTaxRules();
  const filtered = rules.filter((r) => r.id !== ruleId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_TAX_RULES_KEY, JSON.stringify(filtered));
    notifyTaxFeeStoreChanged();
  }
  return true;
}

// Platform Fee Config Store
export function getPlatformFeeConfig(): PlatformFeeConfig {
  if (typeof window === 'undefined') return DEFAULT_PLATFORM_FEE_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_PLATFORM_FEE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PLATFORM_FEE_KEY, JSON.stringify(DEFAULT_PLATFORM_FEE_CONFIG));
      return DEFAULT_PLATFORM_FEE_CONFIG;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PLATFORM_FEE_CONFIG;
  }
}

export function savePlatformFeeConfig(config: PlatformFeeConfig): PlatformFeeConfig {
  const updated = { ...config, updatedAt: new Date().toISOString() };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_PLATFORM_FEE_KEY, JSON.stringify(updated));
    notifyTaxFeeStoreChanged();
  }
  return updated;
}

// Gateway Processing Fees Store
export function getGatewayProcessingFees(): GatewayProcessingFee[] {
  if (typeof window === 'undefined') return DEFAULT_GATEWAY_PROCESSING_FEES;
  try {
    const raw = localStorage.getItem(STORAGE_GATEWAY_FEES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_GATEWAY_FEES_KEY, JSON.stringify(DEFAULT_GATEWAY_PROCESSING_FEES));
      return DEFAULT_GATEWAY_PROCESSING_FEES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_GATEWAY_PROCESSING_FEES;
  }
}

export function saveGatewayProcessingFee(fee: GatewayProcessingFee): GatewayProcessingFee {
  const fees = getGatewayProcessingFees();
  const idx = fees.findIndex((f) => f.gatewayId === fee.gatewayId);

  const updated = { ...fee, updatedAt: new Date().toISOString() };
  if (idx !== -1) {
    fees[idx] = updated;
  } else {
    fees.push(updated);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_GATEWAY_FEES_KEY, JSON.stringify(fees));
    notifyTaxFeeStoreChanged();
  }
  return updated;
}

// Primary Server-Side Calculation Engine
export function calculateTaxAndFees(params: TaxFeeCalculateParams): TaxFeeCalculationResult {
  const baseAmount = Math.max(0, params.baseAmount || 0);
  const currency = params.currency || 'USD';
  const countryCode = (params.countryCode || 'US').toUpperCase();
  const paymentType: PaymentType = params.paymentType || 'checkout';
  const gatewayId = params.gatewayId || 'plugin-mock';
  const creatorTier = params.creatorTierLevel || 1;

  // 1. Tax Rule Resolution
  const taxRules = getTaxRules();
  let matchedTaxRule = taxRules.find(
    (r) => r.isActive && r.countryCode.toUpperCase() === countryCode && r.appliedPaymentTypes.includes(paymentType)
  );

  if (!matchedTaxRule) {
    matchedTaxRule = taxRules.find(
      (r) => r.isActive && r.countryCode.toUpperCase() === 'GLOBAL' && r.appliedPaymentTypes.includes(paymentType)
    );
  }

  const taxName = matchedTaxRule ? matchedTaxRule.taxName : 'Standard Tax';
  const taxRate = matchedTaxRule ? matchedTaxRule.taxRate : 0.0;
  const isInclusiveTax = matchedTaxRule ? matchedTaxRule.isInclusive : false;

  let taxAmount = 0;
  if (isInclusiveTax) {
    taxAmount = Math.round((baseAmount - baseAmount / (1 + taxRate / 100)) * 100) / 100;
  } else {
    taxAmount = Math.round((baseAmount * (taxRate / 100)) * 100) / 100;
  }

  // 2. Platform Fee Resolution
  const platformConfig = getPlatformFeeConfig();
  const tierOverride = platformConfig.tierOverrides?.find((t) => t.tierLevel === creatorTier);
  const platformFeeRate = tierOverride ? tierOverride.platformFeePercentage : platformConfig.defaultPlatformFeePercentage;

  let platformFeeAmount = Math.round((baseAmount * (platformFeeRate / 100)) * 100) / 100;
  if (platformConfig.fixedFeeAmount > 0) {
    platformFeeAmount += platformConfig.fixedFeeAmount;
  }
  if (platformFeeAmount < platformConfig.minimumFeeAmount && baseAmount > 0) {
    platformFeeAmount = platformConfig.minimumFeeAmount;
  }
  platformFeeAmount = Math.round(platformFeeAmount * 100) / 100;

  // 3. Gateway Processing Fee Resolution
  const gatewayFees = getGatewayProcessingFees();
  const matchedGatewayFee = gatewayFees.find((g) => g.gatewayId === gatewayId && g.isActive);

  let gatewayProcessingFee = 0;
  let chargeModel: ChargeModel = 'pass_to_buyer';

  if (matchedGatewayFee) {
    chargeModel = matchedGatewayFee.chargeModel;
    gatewayProcessingFee = Math.round((baseAmount * (matchedGatewayFee.percentageFee / 100) + matchedGatewayFee.fixedFee) * 100) / 100;
  }

  // 4. Net Creator Earnings & Customer Total
  let creatorNetEarning = baseAmount - platformFeeAmount;
  if (chargeModel === 'deduct_from_creator') {
    creatorNetEarning -= gatewayProcessingFee;
  }
  creatorNetEarning = Math.max(0, Math.round(creatorNetEarning * 100) / 100);

  let buyerTotal = baseAmount;
  if (!isInclusiveTax) {
    buyerTotal += taxAmount;
  }
  if (chargeModel === 'pass_to_buyer') {
    buyerTotal += gatewayProcessingFee;
  }
  buyerTotal = Math.round(buyerTotal * 100) / 100;

  return {
    baseAmount,
    currency,
    countryCode,
    paymentType,
    gatewayId,
    taxRuleName: taxName,
    taxRate,
    isInclusiveTax,
    taxAmount,
    platformFeeRate,
    platformFeeAmount,
    gatewayProcessingFee,
    chargeModel,
    creatorNetEarning,
    buyerTotal
  };
}
