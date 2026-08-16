
export interface CheckoutFieldConfig {
  enabled: boolean;
  required: boolean;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  termsUrl?: string;
}

export interface CheckoutConfiguration {
  id: string;
  version: string;
  updatedAt: string;

  // General Appearance & Experience
  general: {
    checkoutTitle: string;
    checkoutSubtitle: string;
    showCreatorInfo: boolean;
    showOrderSummaryBreakdown: boolean;
    showTrustBadges: boolean;
    trustBadgesText: string;
    themeStyle: 'glassmorphic' | 'clean_minimal' | 'modern_dark';
  };

  // Dynamic Form Fields
  fields: {
    fullName: CheckoutFieldConfig;
    billingCountry: CheckoutFieldConfig;
    phone: CheckoutFieldConfig;
    taxId: CheckoutFieldConfig;
    termsCheckbox: CheckoutFieldConfig;
    orderNotes: CheckoutFieldConfig;
  };

  // Currency & Display Format
  currency: {
    defaultCurrency: string; // 'USD', 'BDT', 'EUR', 'GBP', etc.
    currencySymbol: string;   // '$', '৳', '€', '£', etc.
    currencyPosition: 'prefix' | 'suffix';
    decimalPlaces: number;
    allowMultiCurrencyToggle: boolean;
  };

  // Taxes & Surcharge Fees
  taxesAndFees: {
    enableRegionalTax: boolean;
    defaultTaxPercentage: number;
    isTaxInclusive: boolean;
    enableProcessingFeePassThrough: boolean;
    fixedProcessingFee: number;
    percentageProcessingFee: number;
    platformFeeLabel: string;
    taxLabel: string;
  };

  // Coupons & Promotions
  coupons: {
    allowCoupons: boolean;
    allowAutoApplyCoupons: boolean;
    couponInputPlaceholder: string;
  };

  // Routing & Redirects
  redirects: {
    defaultSuccessUrl: string;
    defaultCancelUrl: string;
    autoRedirectAfterSuccess: boolean;
    redirectDelaySeconds: number;
    customSuccessMessage: string;
  };

  // Payment Gateway Custom Prioritization
  gatewayOverrides: Record<string, {
    customLabel?: string;
    customDescription?: string;
    displayOrder?: number;
    isEnabled?: boolean;
    isDefault?: boolean;
  }>;
}

export const DEFAULT_CHECKOUT_CONFIG: CheckoutConfiguration = {
  id: 'global-checkout-config',
  version: '1.2.0',
  updatedAt: new Date().toISOString(),

  general: {
    checkoutTitle: 'Secure Checkout',
    checkoutSubtitle: '256-bit encrypted bank-grade SSL connection',
    showCreatorInfo: true,
    showOrderSummaryBreakdown: true,
    showTrustBadges: true,
    trustBadgesText: '🔒 256-bit SSL encrypted backend credentials. Confidential server vault.',
    themeStyle: 'glassmorphic'
  },

  fields: {
    fullName: {
      enabled: true,
      required: false,
      label: 'Customer Full Name',
      placeholder: 'John Doe',
      defaultValue: ''
    },
    billingCountry: {
      enabled: true,
      required: false,
      label: 'Billing Country / Region',
      defaultValue: 'US'
    },
    phone: {
      enabled: false,
      required: false,
      label: 'Mobile Phone Number',
      placeholder: '+1 (555) 000-0000',
      defaultValue: ''
    },
    taxId: {
      enabled: false,
      required: false,
      label: 'Tax / VAT Identification Number',
      placeholder: 'VAT-12345678',
      defaultValue: ''
    },
    termsCheckbox: {
      enabled: true,
      required: false,
      label: 'I agree to the Digital Content Terms of Service & Privacy Policy',
      termsUrl: '/terms'
    },
    orderNotes: {
      enabled: false,
      required: false,
      label: 'Order Notes & Instructions',
      placeholder: 'Special requests or creator notes...'
    }
  },

  currency: {
    defaultCurrency: 'USD',
    currencySymbol: '$',
    currencyPosition: 'prefix',
    decimalPlaces: 2,
    allowMultiCurrencyToggle: true
  },

  taxesAndFees: {
    enableRegionalTax: true,
    defaultTaxPercentage: 0.0,
    isTaxInclusive: false,
    enableProcessingFeePassThrough: false,
    fixedProcessingFee: 0.0,
    percentageProcessingFee: 0.0,
    platformFeeLabel: 'Payment Processing Surcharge',
    taxLabel: 'Estimated Sales Tax / VAT'
  },

  coupons: {
    allowCoupons: true,
    allowAutoApplyCoupons: true,
    couponInputPlaceholder: 'ENTER PROMO CODE'
  },

  redirects: {
    defaultSuccessUrl: '/balance?success=true',
    defaultCancelUrl: '/balance?cancelled=true',
    autoRedirectAfterSuccess: true,
    redirectDelaySeconds: 2,
    customSuccessMessage: 'Payment processed successfully! Your balance and access have been updated.'
  },

  gatewayOverrides: {
    'plugin-piprapay': {
      customLabel: 'PipraPay (bKash, Nagad, Rocket, Cards)',
      customDescription: 'Instant direct checkout for Bangladesh and global payments.',
      displayOrder: 1,
      isEnabled: true,
      isDefault: false
    },
    'plugin-stripe': {
      customLabel: 'Credit & Debit Cards (Stripe)',
      customDescription: 'Visa, MasterCard, Amex with 3D Secure verification.',
      displayOrder: 2,
      isEnabled: true,
      isDefault: true
    },
    'plugin-paypal': {
      customLabel: 'PayPal Smart Buttons',
      customDescription: 'Pay via PayPal balance or linked bank accounts.',
      displayOrder: 3,
      isEnabled: true,
      isDefault: false
    },
    'plugin-mock': {
      customLabel: 'Developer Mock Sandbox',
      customDescription: 'Instant sandbox testing gateway for developers.',
      displayOrder: 4,
      isEnabled: true,
      isDefault: false
    }
  }
};

const STORAGE_KEY = 'creatorpulse_checkout_configuration';

let memoryCheckoutConfig: CheckoutConfiguration = { ...DEFAULT_CHECKOUT_CONFIG };

/**
 * Reads the checkout configuration from memory or localStorage
 */
export function getCheckoutConfig(): CheckoutConfiguration {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return {
          ...DEFAULT_CHECKOUT_CONFIG,
          ...JSON.parse(saved),
          general: { ...DEFAULT_CHECKOUT_CONFIG.general, ...JSON.parse(saved).general },
          fields: { ...DEFAULT_CHECKOUT_CONFIG.fields, ...JSON.parse(saved).fields },
          currency: { ...DEFAULT_CHECKOUT_CONFIG.currency, ...JSON.parse(saved).currency },
          taxesAndFees: { ...DEFAULT_CHECKOUT_CONFIG.taxesAndFees, ...JSON.parse(saved).taxesAndFees },
          coupons: { ...DEFAULT_CHECKOUT_CONFIG.coupons, ...JSON.parse(saved).coupons },
          redirects: { ...DEFAULT_CHECKOUT_CONFIG.redirects, ...JSON.parse(saved).redirects },
          gatewayOverrides: { ...DEFAULT_CHECKOUT_CONFIG.gatewayOverrides, ...JSON.parse(saved).gatewayOverrides }
        };
      }
    } catch (e) {
      console.warn('[CheckoutConfigStore] Failed to read from localStorage', e);
    }
  }

  return memoryCheckoutConfig;
}

/**
 * Saves and persists checkout configuration
 */
export function saveCheckoutConfig(config: Partial<CheckoutConfiguration>): CheckoutConfiguration {
  const current = getCheckoutConfig();
  const updated: CheckoutConfiguration = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString()
  };

  memoryCheckoutConfig = updated;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('creatorpulse_checkout_config_updated', { detail: updated }));
    } catch (e) {
      console.error('[CheckoutConfigStore] Failed to save to localStorage', e);
    }
  }

  return updated;
}

/**
 * Resets checkout configuration to defaults
 */
export function resetCheckoutConfig(): CheckoutConfiguration {
  return saveCheckoutConfig(DEFAULT_CHECKOUT_CONFIG);
}

/**
 * Formats a price based on checkout configuration settings
 */
export function formatCheckoutPrice(
  amount: number,
  currencyCode = 'USD',
  config?: CheckoutConfiguration
): string {
  const cfg = config || getCheckoutConfig();
  const symbol = cfg.currency.currencySymbol || (currencyCode === 'BDT' ? '৳' : currencyCode === 'EUR' ? '€' : currencyCode === 'GBP' ? '£' : '$');
  const decimals = cfg.currency.decimalPlaces !== undefined ? cfg.currency.decimalPlaces : 2;
  const formattedNumber = amount.toFixed(decimals);

  if (cfg.currency.currencyPosition === 'suffix') {
    return `${formattedNumber}${symbol} ${currencyCode}`;
  }
  return `${symbol}${formattedNumber} ${currencyCode}`;
}
