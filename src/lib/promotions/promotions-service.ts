
export type DiscountType = 'percentage' | 'fixed';
export type PromotionStatus = 'active' | 'scheduled' | 'expired' | 'exhausted' | 'inactive';
export type TargetScope = 'all' | 'creator' | 'membership_plan';

export interface CouponPromotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number; // Percentage e.g. 20 or fixed amount e.g. 10.00
  minPurchaseAmount: number; // Minimum order value required
  maxDiscountAmount?: number; // Optional cap for percentage discounts
  totalUsageLimit?: number; // Maximum total redemptions allowed
  perUserLimit?: number; // Max uses per user (default: 1)
  currentUsageCount: number;
  startDate: string; // ISO String or YYYY-MM-DD
  expiryDate: string; // ISO String or YYYY-MM-DD
  isAutoApplied: boolean; // Triggers automatically without typing code
  scope: TargetScope;
  targetCreatorId?: string; // Creator ID constraint (e.g. 'user-creator-1')
  targetCreatorName?: string;
  targetPlanId?: string; // Membership Plan ID constraint (e.g. 'plan-premium-1')
  targetPlanName?: string;
  status: PromotionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  couponCode: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  userId: string;
  userName?: string;
  creatorId?: string;
  creatorName?: string;
  planId?: string;
  planName?: string;
  originalAmount: number;
  finalAmount: number;
  gatewayId: string;
  transactionId?: string;
  redeemedAt: string;
}

export interface ValidateCouponParams {
  code?: string;
  amount: number;
  userId?: string;
  creatorId?: string;
  planId?: string;
  checkAutoApply?: boolean;
}

export interface ValidateCouponResult {
  valid: boolean;
  coupon?: CouponPromotion;
  discountAmount: number;
  finalAmount: number;
  originalAmount: number;
  isAutoApplied?: boolean;
  message: string;
}

export interface PromotionAnalytics {
  totalCoupons: number;
  activePromotions: number;
  totalRedemptions: number;
  totalDiscountSavings: number;
  avgDiscountValue: number;
  topPerformingCoupons: {
    code: string;
    redemptions: number;
    totalSavings: number;
  }[];
}


// Initial seed data for pre-populating platform promotions
export const INITIAL_PROMOTIONS: CouponPromotion[] = [
  {
    id: 'promo-welcome20',
    code: 'WELCOME20',
    title: 'Welcome New Creator Fan',
    description: 'Get 20% off your first creator membership or digital purchase across CreatorPulse.',
    discountType: 'percentage',
    discountValue: 20,
    minPurchaseAmount: 5.0,
    maxDiscountAmount: 25.0,
    totalUsageLimit: 500,
    perUserLimit: 1,
    currentUsageCount: 42,
    startDate: '2026-01-01T00:00:00.000Z',
    expiryDate: '2026-12-31T23:59:59.000Z',
    isAutoApplied: false,
    scope: 'all',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'promo-sarah5off',
    code: 'SARAHVIP',
    title: 'Sarah Jenkins Exclusive Fan Special',
    description: 'Save $5.00 on Sarah Jenkins Pro Designer Tier membership.',
    discountType: 'fixed',
    discountValue: 5.0,
    minPurchaseAmount: 10.0,
    totalUsageLimit: 100,
    perUserLimit: 1,
    currentUsageCount: 18,
    startDate: '2026-02-01T00:00:00.000Z',
    expiryDate: '2026-11-30T23:59:59.000Z',
    isAutoApplied: false,
    scope: 'creator',
    targetCreatorId: 'user-creator-1',
    targetCreatorName: 'Sarah Jenkins',
    status: 'active',
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'promo-autosummer',
    code: 'AUTOSUMMER',
    title: 'Summer Creator Bonus 15%',
    description: 'Auto-applied 15% discount for any creator purchase over $15.00.',
    discountType: 'percentage',
    discountValue: 15,
    minPurchaseAmount: 15.0,
    totalUsageLimit: 250,
    perUserLimit: 2,
    currentUsageCount: 65,
    startDate: '2026-06-01T00:00:00.000Z',
    expiryDate: '2026-09-30T23:59:59.000Z',
    isAutoApplied: true,
    scope: 'all',
    status: 'active',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'promo-marcuspro',
    code: 'MARCUSCODE10',
    title: 'Marcus Vance Tech Tier $10 Off',
    description: 'Special $10 discount for Marcus Vance Next.js Architecture Masterclass.',
    discountType: 'fixed',
    discountValue: 10.0,
    minPurchaseAmount: 15.0,
    totalUsageLimit: 50,
    perUserLimit: 1,
    currentUsageCount: 12,
    startDate: '2026-03-01T00:00:00.000Z',
    expiryDate: '2026-10-31T23:59:59.000Z',
    isAutoApplied: false,
    scope: 'creator',
    targetCreatorId: 'user-creator-2',
    targetCreatorName: 'Marcus Vance',
    status: 'active',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
];

export const INITIAL_REDEMPTIONS: CouponRedemption[] = [
  {
    id: 'red-101',
    couponId: 'promo-welcome20',
    couponCode: 'WELCOME20',
    discountType: 'percentage',
    discountValue: 20,
    discountAmount: 3.0,
    userId: 'user-member',
    userName: 'Alex Vance',
    creatorId: 'user-creator-1',
    creatorName: 'Sarah Jenkins',
    planId: 'plan-premium-1',
    planName: 'Pro Designer Tier',
    originalAmount: 15.0,
    finalAmount: 12.0,
    gatewayId: 'plugin-mock',
    transactionId: 'tx-mock-9981',
    redeemedAt: '2026-08-14T10:15:00.000Z',
  },
  {
    id: 'red-102',
    couponId: 'promo-sarah5off',
    couponCode: 'SARAHVIP',
    discountType: 'fixed',
    discountValue: 5.0,
    discountAmount: 5.0,
    userId: 'user-member',
    userName: 'Alex Vance',
    creatorId: 'user-creator-1',
    creatorName: 'Sarah Jenkins',
    originalAmount: 15.0,
    finalAmount: 10.0,
    gatewayId: 'plugin-stripe',
    transactionId: 'tx-stripe-3341',
    redeemedAt: '2026-08-13T16:45:00.000Z',
  },
  {
    id: 'red-103',
    couponId: 'promo-autosummer',
    couponCode: 'AUTOSUMMER',
    discountType: 'percentage',
    discountValue: 15,
    discountAmount: 4.5,
    userId: 'user-member',
    userName: 'Alex Vance',
    creatorId: 'user-creator-2',
    creatorName: 'Marcus Vance',
    originalAmount: 30.0,
    finalAmount: 25.5,
    gatewayId: 'plugin-paypal',
    transactionId: 'tx-paypal-7712',
    redeemedAt: '2026-08-12T14:20:00.000Z',
  },
];

function getNodeFs() {
  if (typeof window !== 'undefined') return null;
  try {
    const req = eval('require');
    return {
      fs: req('fs'),
      path: req('path')
    };
  } catch {
    return null;
  }
}

function getDataFile(): string {
  const node = getNodeFs();
  if (!node || !node.path || typeof process === 'undefined' || !process.cwd) return '';
  return node.path.join(process.cwd(), 'src/lib/promotions/promotions.json');
}

interface PromotionsStoreData {
  promotions: CouponPromotion[];
  redemptions: CouponRedemption[];
}

function loadPromotionsData(): PromotionsStoreData {
  try {
    const node = getNodeFs();
    const dataFile = getDataFile();
    if (node && node.fs && dataFile && node.fs.existsSync(dataFile)) {
      const raw = node.fs.readFileSync(dataFile, 'utf8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.promotions)) {
        return data;
      }
    }
  } catch (e) {
    console.error('[Promotions Service] Failed reading storage file:', e);
  }

  // Fallback to initial seeds and initialize file
  const initialData: PromotionsStoreData = {
    promotions: INITIAL_PROMOTIONS,
    redemptions: INITIAL_REDEMPTIONS,
  };
  savePromotionsData(initialData);
  return initialData;
}

function savePromotionsData(data: PromotionsStoreData): void {
  try {
    const node = getNodeFs();
    const dataFile = getDataFile();
    if (node && node.fs && node.path && dataFile) {
      const dir = node.path.dirname(dataFile);
      if (!node.fs.existsSync(dir)) {
        node.fs.mkdirSync(dir, { recursive: true });
      }
      node.fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
    }
  } catch (e) {
    console.error('[Promotions Service] Failed writing storage file:', e);
  }
}

/**
 * Calculates current status for a promotion based on timestamps & limits
 */
export function computePromotionStatus(promo: CouponPromotion): PromotionStatus {
  if (promo.status === 'inactive') return 'inactive';
  
  const now = new Date().getTime();
  const start = new Date(promo.startDate).getTime();
  const expiry = new Date(promo.expiryDate).getTime();

  if (now < start) return 'scheduled';
  if (now > expiry) return 'expired';
  if (promo.totalUsageLimit !== undefined && promo.totalUsageLimit > 0 && promo.currentUsageCount >= promo.totalUsageLimit) {
    return 'exhausted';
  }
  return 'active';
}

/**
 * Get all promotions with dynamically calculated statuses
 */
export function getAllPromotions(): CouponPromotion[] {
  const store = loadPromotionsData();
  let updated = false;

  const promotions = store.promotions.map((p) => {
    const computed = computePromotionStatus(p);
    if (computed !== p.status && p.status !== 'inactive') {
      updated = true;
      return { ...p, status: computed };
    }
    return p;
  });

  if (updated) {
    savePromotionsData({ ...store, promotions });
  }

  return promotions;
}

/**
 * Validates a coupon code against checkout parameters
 */
export function validateCoupon(params: ValidateCouponParams): ValidateCouponResult {
  const { code, amount, userId, creatorId, planId, checkAutoApply = false } = params;
  const store = loadPromotionsData();
  const allPromos = getAllPromotions();

  let targetPromo: CouponPromotion | undefined;
  let isAuto = false;

  if (code) {
    const cleanedCode = code.trim().toUpperCase();
    targetPromo = allPromos.find((p) => p.code.toUpperCase() === cleanedCode);
    if (!targetPromo) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: amount,
        originalAmount: amount,
        message: `Coupon code "${code}" is invalid or does not exist.`,
      };
    }
  } else if (checkAutoApply) {
    // Search for best auto-applied promotion
    const eligibleAutoPromos = allPromos.filter((p) => {
      if (!p.isAutoApplied) return false;
      const status = computePromotionStatus(p);
      if (status !== 'active') return false;
      if (amount < p.minPurchaseAmount) return false;

      // Creator check
      if (p.scope === 'creator' && p.targetCreatorId && p.targetCreatorId !== creatorId) {
        return false;
      }
      // Plan check
      if (p.scope === 'membership_plan' && p.targetPlanId && p.targetPlanId !== planId) {
        return false;
      }

      // Per user limit check
      if (userId && p.perUserLimit) {
        const userRedemptions = store.redemptions.filter(
          (r) => r.couponId === p.id && r.userId === userId
        ).length;
        if (userRedemptions >= p.perUserLimit) return false;
      }

      return true;
    });

    if (eligibleAutoPromos.length > 0) {
      // Pick the auto promo giving the highest discount
      eligibleAutoPromos.sort((a, b) => {
        const discountA = a.discountType === 'percentage' ? (amount * a.discountValue) / 100 : a.discountValue;
        const discountB = b.discountType === 'percentage' ? (amount * b.discountValue) / 100 : b.discountValue;
        return discountB - discountA;
      });
      targetPromo = eligibleAutoPromos[0];
      isAuto = true;
    }
  }

  if (!targetPromo) {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: amount,
      originalAmount: amount,
      message: 'No coupon code provided or auto-applied promotion available.',
    };
  }

  // Validate Status
  const currentStatus = computePromotionStatus(targetPromo);
  if (currentStatus === 'inactive') {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: amount,
      originalAmount: amount,
      message: `Coupon "${targetPromo.code}" is currently disabled.`,
    };
  }
  if (currentStatus === 'scheduled') {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: amount,
      originalAmount: amount,
      message: `Coupon "${targetPromo.code}" is scheduled for a future start date.`,
    };
  }
  if (currentStatus === 'expired') {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: amount,
      originalAmount: amount,
      message: `Coupon "${targetPromo.code}" has expired on ${new Date(targetPromo.expiryDate).toLocaleDateString()}.`,
    };
  }
  if (currentStatus === 'exhausted') {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: amount,
      originalAmount: amount,
      message: `Coupon "${targetPromo.code}" has reached its total usage limit.`,
    };
  }

  // Validate Minimum Purchase Rule
  if (amount < targetPromo.minPurchaseAmount) {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: amount,
      originalAmount: amount,
      message: `Minimum purchase of $${targetPromo.minPurchaseAmount.toFixed(2)} required for coupon "${targetPromo.code}".`,
    };
  }

  // Scope: Creator Constraint
  if (targetPromo.scope === 'creator' && targetPromo.targetCreatorId) {
    if (targetPromo.targetCreatorId !== creatorId) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: amount,
        originalAmount: amount,
        message: `Coupon "${targetPromo.code}" is valid only for ${targetPromo.targetCreatorName || 'a specific creator'}.`,
      };
    }
  }

  // Scope: Membership Plan Constraint
  if (targetPromo.scope === 'membership_plan' && targetPromo.targetPlanId) {
    if (targetPromo.targetPlanId !== planId) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: amount,
        originalAmount: amount,
        message: `Coupon "${targetPromo.code}" is valid only for tier "${targetPromo.targetPlanName || 'specific plan'}".`,
      };
    }
  }

  // Per-User Limit Check
  if (userId && targetPromo.perUserLimit) {
    const userRedemptions = store.redemptions.filter(
      (r) => r.couponId === targetPromo!.id && r.userId === userId
    ).length;
    if (userRedemptions >= targetPromo.perUserLimit) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: amount,
        originalAmount: amount,
        message: `You have reached the maximum redemption limit (${targetPromo.perUserLimit}) for coupon "${targetPromo.code}".`,
      };
    }
  }

  // Calculate Discount Amount
  let rawDiscount = 0;
  if (targetPromo.discountType === 'percentage') {
    rawDiscount = (amount * targetPromo.discountValue) / 100;
    if (targetPromo.maxDiscountAmount && targetPromo.maxDiscountAmount > 0) {
      rawDiscount = Math.min(rawDiscount, targetPromo.maxDiscountAmount);
    }
  } else {
    rawDiscount = targetPromo.discountValue;
  }

  // Cap discount at total original amount
  const discountAmount = Math.min(rawDiscount, amount);
  const finalAmount = Math.max(0, amount - discountAmount);

  return {
    valid: true,
    coupon: targetPromo,
    discountAmount,
    finalAmount,
    originalAmount: amount,
    isAutoApplied: isAuto,
    message: isAuto
      ? `Auto-applied promo "${targetPromo.code}" (${targetPromo.discountType === 'percentage' ? targetPromo.discountValue + '%' : '$' + targetPromo.discountValue} OFF)`
      : `Coupon "${targetPromo.code}" applied successfully! You save $${discountAmount.toFixed(2)}.`,
  };
}

/**
 * Creates a new coupon / promotion
 */
export function createPromotion(promoData: Omit<CouponPromotion, 'id' | 'currentUsageCount' | 'status' | 'createdAt' | 'updatedAt'>): CouponPromotion {
  const store = loadPromotionsData();

  // Ensure code uniqueness
  const cleanCode = promoData.code.trim().toUpperCase();
  if (store.promotions.some((p) => p.code.toUpperCase() === cleanCode)) {
    throw new Error(`Promotion code "${cleanCode}" already exists.`);
  }

  const now = new Date().toISOString();
  const newPromo: CouponPromotion = {
    ...promoData,
    id: `promo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    code: cleanCode,
    currentUsageCount: 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  newPromo.status = computePromotionStatus(newPromo);

  store.promotions.unshift(newPromo);
  savePromotionsData(store);
  return newPromo;
}

/**
 * Updates an existing coupon / promotion
 */
export function updatePromotion(id: string, updates: Partial<CouponPromotion>): CouponPromotion {
  const store = loadPromotionsData();
  const index = store.promotions.findIndex((p) => p.id === id);

  if (index === -1) {
    throw new Error(`Promotion with ID "${id}" not found.`);
  }

  const existing = store.promotions[index];
  let updatedCode = existing.code;

  if (updates.code) {
    updatedCode = updates.code.trim().toUpperCase();
    if (
      updatedCode !== existing.code.toUpperCase() &&
      store.promotions.some((p) => p.id !== id && p.code.toUpperCase() === updatedCode)
    ) {
      throw new Error(`Promotion code "${updatedCode}" is already in use by another coupon.`);
    }
  }

  const updatedPromo: CouponPromotion = {
    ...existing,
    ...updates,
    code: updatedCode,
    updatedAt: new Date().toISOString(),
  };

  updatedPromo.status = computePromotionStatus(updatedPromo);

  store.promotions[index] = updatedPromo;
  savePromotionsData(store);
  return updatedPromo;
}

/**
 * Deletes a promotion
 */
export function deletePromotion(id: string): boolean {
  const store = loadPromotionsData();
  const initialCount = store.promotions.length;
  store.promotions = store.promotions.filter((p) => p.id !== id);

  if (store.promotions.length < initialCount) {
    savePromotionsData(store);
    return true;
  }
  return false;
}

/**
 * Records a coupon redemption upon successful payment completion
 */
export function recordCouponRedemption(params: {
  couponId: string;
  userId: string;
  userName?: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  gatewayId: string;
  transactionId?: string;
  creatorId?: string;
  creatorName?: string;
  planId?: string;
  planName?: string;
}): CouponRedemption {
  const store = loadPromotionsData();
  const promoIndex = store.promotions.findIndex((p) => p.id === params.couponId);

  let promoCode = 'UNKNOWN';
  let discountType: DiscountType = 'fixed';
  let discountValue = params.discountAmount;

  if (promoIndex !== -1) {
    const promo = store.promotions[promoIndex];
    promoCode = promo.code;
    discountType = promo.discountType;
    discountValue = promo.discountValue;

    // Increment usage count
    promo.currentUsageCount += 1;
    promo.status = computePromotionStatus(promo);
    promo.updatedAt = new Date().toISOString();
  }

  const redemption: CouponRedemption = {
    id: `red-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    couponId: params.couponId,
    couponCode: promoCode,
    discountType,
    discountValue,
    discountAmount: params.discountAmount,
    userId: params.userId,
    userName: params.userName || 'Alex Vance',
    creatorId: params.creatorId,
    creatorName: params.creatorName,
    planId: params.planId,
    planName: params.planName,
    originalAmount: params.originalAmount,
    finalAmount: params.finalAmount,
    gatewayId: params.gatewayId,
    transactionId: params.transactionId || `tx-${Date.now()}`,
    redeemedAt: new Date().toISOString(),
  };

  store.redemptions.unshift(redemption);
  savePromotionsData(store);
  return redemption;
}

/**
 * Retrieves redemption history
 */
export function getRedemptionHistory(): CouponRedemption[] {
  const store = loadPromotionsData();
  return store.redemptions;
}

/**
 * Computes real-time promotion analytics
 */
export function getPromotionAnalytics(): PromotionAnalytics {
  const store = loadPromotionsData();
  const promotions = getAllPromotions();
  const redemptions = store.redemptions;

  const totalCoupons = promotions.length;
  const activePromotions = promotions.filter((p) => p.status === 'active').length;
  const totalRedemptions = redemptions.length;
  const totalDiscountSavings = redemptions.reduce((acc, r) => acc + (r.discountAmount || 0), 0);
  const avgDiscountValue = totalRedemptions > 0 ? totalDiscountSavings / totalRedemptions : 0;

  // Aggregate top performing coupons
  const couponMap: Record<string, { code: string; redemptions: number; totalSavings: number }> = {};

  redemptions.forEach((r) => {
    if (!couponMap[r.couponCode]) {
      couponMap[r.couponCode] = { code: r.couponCode, redemptions: 0, totalSavings: 0 };
    }
    couponMap[r.couponCode].redemptions += 1;
    couponMap[r.couponCode].totalSavings += r.discountAmount || 0;
  });

  const topPerformingCoupons = Object.values(couponMap)
    .sort((a, b) => b.redemptions - a.redemptions)
    .slice(0, 5);

  return {
    totalCoupons,
    activePromotions,
    totalRedemptions,
    totalDiscountSavings,
    avgDiscountValue,
    topPerformingCoupons,
  };
}
