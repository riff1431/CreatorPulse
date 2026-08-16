import { getGatewayAdapter } from './payment-service';

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'yearly' | 'custom';
export type SubscriptionStatus = 'active' | 'in_grace' | 'past_due' | 'cancelled' | 'expired' | 'suspended';
export type BillingReason = 'initial_purchase' | 'renewal' | 'upgrade' | 'downgrade' | 'retry_payment';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  customDays?: number;
  trialDays: number;
  setupFee: number;
  tierLevel: number; // 1 = Basic/Starter, 2 = Pro, 3 = VIP/Elite
  gracePeriodDays: number;
  maxRetryAttempts: number;
  retryIntervalDays: number;
  features: string[];
  isActive: boolean;
  activeSubscribersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriberSubscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  planId: string;
  planName: string;
  tierLevel: number;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  autoRenew: boolean;
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  gracePeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  cancellationReason?: string;
  failedAttempts: number;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  gatewayId: string;
  gatewaySubscriptionId?: string;
  gatewayCustomerId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionAuditLog {
  id: string;
  subscriptionId: string;
  subscriberName: string;
  action:
    | 'CREATED'
    | 'RENEWED'
    | 'PAYMENT_FAILED'
    | 'RETRY_ATTEMPT'
    | 'GRACE_PERIOD_ENTERED'
    | 'UPGRADED'
    | 'DOWNGRADED'
    | 'CANCELLED'
    | 'RESUMED'
    | 'EXPIRED'
    | 'SUSPENDED'
    | 'MANUAL_OVERRIDE';
  description: string;
  performedBy: 'system' | 'admin' | 'subscriber' | 'gateway_webhook';
  gatewayId: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface GatewayBillingConfig {
  gatewayId: string;
  gatewayName: string;
  supportsRecurring: boolean;
  subscriptionMode: 'direct_gateway' | 'tokenized_recurring' | 'managed_retry';
  retrySchedule: number[]; // e.g. [1, 3, 7] days
  gracePeriodDays: number;
  autoCancelOnMaxRetries: boolean;
  webhookSyncEnabled: boolean;
  customSettings: Record<string, any>;
}

const STORAGE_PLANS_KEY = 'creatorpulse_subscription_plans';
const STORAGE_SUBSCRIPTIONS_KEY = 'creatorpulse_subscriber_subscriptions';
const STORAGE_LOGS_KEY = 'creatorpulse_subscription_logs';
const STORAGE_GATEWAY_CONFIGS_KEY = 'creatorpulse_gateway_billing_configs';

// Default initial plans
export const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter Community Tier',
    slug: 'starter-community',
    description: 'Basic access to creator feed, exclusive public posts, and community discussions.',
    price: 5.0,
    currency: 'USD',
    billingCycle: 'monthly',
    trialDays: 7,
    setupFee: 0,
    tierLevel: 1,
    gracePeriodDays: 3,
    maxRetryAttempts: 3,
    retryIntervalDays: 2,
    features: ['Access to creator main feed', 'Leave comments on public posts', 'Member badge in comments'],
    isActive: true,
    activeSubscribersCount: 142,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'plan-pro',
    name: 'Pro Creator Tier',
    slug: 'pro-creator',
    description: 'Full access to premium posts, HD video reels, downloadable digital assets, and direct chat.',
    price: 15.0,
    currency: 'USD',
    billingCycle: 'monthly',
    trialDays: 0,
    setupFee: 0,
    tierLevel: 2,
    gracePeriodDays: 5,
    maxRetryAttempts: 3,
    retryIntervalDays: 3,
    features: ['All Starter tier features', 'Unlock premium high-res posts', 'Exclusive member-only reels & stories', 'Direct message creator access'],
    isActive: true,
    activeSubscribersCount: 389,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'plan-vip',
    name: 'VIP Inner Circle',
    slug: 'vip-inner-circle',
    description: 'Ultimate VIP membership with 1-on-1 calls, early content drops, custom request priority, and secret group access.',
    price: 30.0,
    currency: 'USD',
    billingCycle: 'monthly',
    trialDays: 0,
    setupFee: 10.0,
    tierLevel: 3,
    gracePeriodDays: 7,
    maxRetryAttempts: 4,
    retryIntervalDays: 3,
    features: ['All Pro tier features', '1-on-1 Monthly Video Q&A Call', 'Exclusive Telegram/Discord VIP badge', 'Priority custom request queue', 'No platform service fees on tips'],
    isActive: true,
    activeSubscribersCount: 94,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'plan-annual-vip',
    name: 'VIP Inner Circle (Annual Pass)',
    slug: 'vip-inner-circle-annual',
    description: 'Get 2 months free with our annual VIP membership pass.',
    price: 300.0,
    currency: 'USD',
    billingCycle: 'yearly',
    trialDays: 0,
    setupFee: 0,
    tierLevel: 3,
    gracePeriodDays: 14,
    maxRetryAttempts: 5,
    retryIntervalDays: 4,
    features: ['Includes all VIP Inner Circle features', '2 Months Savings Discount', 'Exclusive Annual Creator Gift Pack'],
    isActive: true,
    activeSubscribersCount: 48,
    createdAt: '2026-02-15T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  }
];

// Default initial subscriber subscriptions
export const DEFAULT_SUBSCRIBER_SUBSCRIPTIONS: SubscriberSubscription[] = [
  {
    id: 'sub-1001',
    userId: 'usr-alex',
    userName: 'Alex Vance',
    userEmail: 'alex.vance@example.com',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    creatorId: 'crt-sarah',
    creatorName: 'Sarah Jenkins',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    planId: 'plan-pro',
    planName: 'Pro Creator Tier',
    tierLevel: 2,
    amount: 15.0,
    currency: 'USD',
    billingCycle: 'monthly',
    status: 'active',
    autoRenew: true,
    startDate: '2026-07-01T10:00:00.000Z',
    currentPeriodStart: '2026-08-01T10:00:00.000Z',
    currentPeriodEnd: '2026-09-01T10:00:00.000Z',
    cancelAtPeriodEnd: false,
    failedAttempts: 0,
    gatewayId: 'plugin-stripe',
    gatewaySubscriptionId: 'sub_st_998124',
    gatewayCustomerId: 'cus_st_alex89',
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'sub-1002',
    userId: 'usr-jordan',
    userName: 'Jordan Lee',
    userEmail: 'jordan.lee@example.com',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    creatorId: 'crt-marcus',
    creatorName: 'Marcus Vance',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    planId: 'plan-vip',
    planName: 'VIP Inner Circle',
    tierLevel: 3,
    amount: 30.0,
    currency: 'USD',
    billingCycle: 'monthly',
    status: 'in_grace',
    autoRenew: true,
    startDate: '2026-07-10T14:30:00.000Z',
    currentPeriodStart: '2026-08-10T14:30:00.000Z',
    currentPeriodEnd: '2026-08-15T14:30:00.000Z',
    gracePeriodEnd: '2026-08-22T14:30:00.000Z',
    cancelAtPeriodEnd: false,
    failedAttempts: 2,
    lastAttemptAt: '2026-08-14T15:00:00.000Z',
    nextRetryAt: '2026-08-17T15:00:00.000Z',
    gatewayId: 'plugin-paypal',
    gatewaySubscriptionId: 'I-PP98712399',
    createdAt: '2026-07-10T14:30:00.000Z',
    updatedAt: '2026-08-14T15:00:00.000Z'
  },
  {
    id: 'sub-1003',
    userId: 'usr-mia',
    userName: 'Mia Wong',
    userEmail: 'mia.wong@example.com',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    creatorId: 'crt-sarah',
    creatorName: 'Sarah Jenkins',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    planId: 'plan-starter',
    planName: 'Starter Community Tier',
    tierLevel: 1,
    amount: 5.0,
    currency: 'USD',
    billingCycle: 'monthly',
    status: 'cancelled',
    autoRenew: false,
    startDate: '2026-05-01T08:00:00.000Z',
    currentPeriodStart: '2026-07-01T08:00:00.000Z',
    currentPeriodEnd: '2026-08-01T08:00:00.000Z',
    cancelAtPeriodEnd: true,
    cancelledAt: '2026-07-25T11:20:00.000Z',
    cancellationReason: 'Switched to alternative creator content',
    failedAttempts: 0,
    gatewayId: 'plugin-piprapay',
    gatewaySubscriptionId: 'pp_sub_774109',
    createdAt: '2026-05-01T08:00:00.000Z',
    updatedAt: '2026-07-25T11:20:00.000Z'
  },
  {
    id: 'sub-1004',
    userId: 'usr-david',
    userName: 'David Miller',
    userEmail: 'david.m@example.com',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    creatorId: 'crt-marcus',
    creatorName: 'Marcus Vance',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    planId: 'plan-annual-vip',
    planName: 'VIP Inner Circle (Annual Pass)',
    tierLevel: 3,
    amount: 300.0,
    currency: 'USD',
    billingCycle: 'yearly',
    status: 'active',
    autoRenew: true,
    startDate: '2026-01-01T00:00:00.000Z',
    currentPeriodStart: '2026-01-01T00:00:00.000Z',
    currentPeriodEnd: '2027-01-01T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    failedAttempts: 0,
    gatewayId: 'plugin-stripe',
    gatewaySubscriptionId: 'sub_st_annual442',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'sub-1005',
    userId: 'usr-elena',
    userName: 'Elena Rostova',
    userEmail: 'elena.rostova@example.com',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    creatorId: 'crt-sarah',
    creatorName: 'Sarah Jenkins',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    planId: 'plan-pro',
    planName: 'Pro Creator Tier',
    tierLevel: 2,
    amount: 15.0,
    currency: 'USD',
    billingCycle: 'monthly',
    status: 'past_due',
    autoRenew: true,
    startDate: '2026-06-15T00:00:00.000Z',
    currentPeriodStart: '2026-07-15T00:00:00.000Z',
    currentPeriodEnd: '2026-08-15T00:00:00.000Z',
    gracePeriodEnd: '2026-08-20T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    failedAttempts: 3,
    lastAttemptAt: '2026-08-16T09:00:00.000Z',
    nextRetryAt: '2026-08-18T09:00:00.000Z',
    gatewayId: 'plugin-mock',
    gatewaySubscriptionId: 'sub_mock_8812',
    createdAt: '2026-06-15T00:00:00.000Z',
    updatedAt: '2026-08-16T09:00:00.000Z'
  }
];

// Initial Audit Logs
export const DEFAULT_SUBSCRIPTION_LOGS: SubscriptionAuditLog[] = [
  {
    id: 'log-1',
    subscriptionId: 'sub-1002',
    subscriberName: 'Jordan Lee',
    action: 'PAYMENT_FAILED',
    description: 'Recurring monthly billing charge failed on PayPal (Insufficient funds). Entered grace period.',
    performedBy: 'gateway_webhook',
    gatewayId: 'plugin-paypal',
    timestamp: '2026-08-14T15:00:00.000Z',
    details: { gatewayCode: 'INSTRUMENT_DECLINED', retryCount: 2 }
  },
  {
    id: 'log-2',
    subscriptionId: 'sub-1001',
    subscriberName: 'Alex Vance',
    action: 'RENEWED',
    description: 'Monthly subscription auto-renewed successfully via Stripe.',
    performedBy: 'system',
    gatewayId: 'plugin-stripe',
    timestamp: '2026-08-01T10:00:00.000Z',
    details: { amount: 15.0, transactionId: 'ch_stripe_881920' }
  },
  {
    id: 'log-3',
    subscriptionId: 'sub-1003',
    subscriberName: 'Mia Wong',
    action: 'CANCELLED',
    description: 'Subscriber requested cancellation at period end.',
    performedBy: 'subscriber',
    gatewayId: 'plugin-piprapay',
    timestamp: '2026-07-25T11:20:00.000Z',
    details: { reason: 'Switched to alternative creator content' }
  }
];

// Initial Gateway Billing Configs
export const DEFAULT_GATEWAY_BILLING_CONFIGS: GatewayBillingConfig[] = [
  {
    gatewayId: 'plugin-stripe',
    gatewayName: 'Stripe Payments',
    supportsRecurring: true,
    subscriptionMode: 'direct_gateway',
    retrySchedule: [1, 3, 7, 14],
    gracePeriodDays: 7,
    autoCancelOnMaxRetries: true,
    webhookSyncEnabled: true,
    customSettings: { customerPortalEnabled: true, prorationBehavior: 'create_prorations' }
  },
  {
    gatewayId: 'plugin-paypal',
    gatewayName: 'PayPal Commerce',
    supportsRecurring: true,
    subscriptionMode: 'tokenized_recurring',
    retrySchedule: [2, 5, 9],
    gracePeriodDays: 5,
    autoCancelOnMaxRetries: false,
    webhookSyncEnabled: true,
    customSettings: { billingAgreementRequired: true }
  },
  {
    gatewayId: 'plugin-piprapay',
    gatewayName: 'PipraPay Gateway',
    supportsRecurring: true,
    subscriptionMode: 'managed_retry',
    retrySchedule: [1, 3, 5],
    gracePeriodDays: 5,
    autoCancelOnMaxRetries: true,
    webhookSyncEnabled: true,
    customSettings: { autoRedirectUrl: true, currencyOverride: 'BDT' }
  },
  {
    gatewayId: 'plugin-mock',
    gatewayName: 'Mock Sandbox Gateway',
    supportsRecurring: true,
    subscriptionMode: 'managed_retry',
    retrySchedule: [1, 2],
    gracePeriodDays: 3,
    autoCancelOnMaxRetries: false,
    webhookSyncEnabled: true,
    customSettings: { autoApproveRetries: true }
  }
];

// Store helpers
function notifySubscriptionBillingChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('creatorpulse_subscription_billing_updated'));
  }
}

// Subscription Plans Store
export function getSubscriptionPlans(): SubscriptionPlan[] {
  if (typeof window === 'undefined') return DEFAULT_SUBSCRIPTION_PLANS;
  try {
    const raw = localStorage.getItem(STORAGE_PLANS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PLANS_KEY, JSON.stringify(DEFAULT_SUBSCRIPTION_PLANS));
      return DEFAULT_SUBSCRIPTION_PLANS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SUBSCRIPTION_PLANS;
  }
}

export function saveSubscriptionPlan(plan: Partial<SubscriptionPlan>): SubscriptionPlan {
  const plans = getSubscriptionPlans();
  const now = new Date().toISOString();

  let updatedPlan: SubscriptionPlan;
  if (plan.id) {
    const idx = plans.findIndex((p) => p.id === plan.id);
    if (idx !== -1) {
      updatedPlan = { ...plans[idx], ...plan, updatedAt: now };
      plans[idx] = updatedPlan;
    } else {
      updatedPlan = {
        id: plan.id,
        name: plan.name || 'New Plan',
        slug: plan.slug || 'new-plan',
        description: plan.description || '',
        price: plan.price || 9.99,
        currency: plan.currency || 'USD',
        billingCycle: plan.billingCycle || 'monthly',
        trialDays: plan.trialDays || 0,
        setupFee: plan.setupFee || 0,
        tierLevel: plan.tierLevel || 1,
        gracePeriodDays: plan.gracePeriodDays || 5,
        maxRetryAttempts: plan.maxRetryAttempts || 3,
        retryIntervalDays: plan.retryIntervalDays || 3,
        features: plan.features || [],
        isActive: plan.isActive ?? true,
        activeSubscribersCount: plan.activeSubscribersCount || 0,
        createdAt: now,
        updatedAt: now
      };
      plans.unshift(updatedPlan);
    }
  } else {
    const id = `plan-${Date.now()}`;
    updatedPlan = {
      id,
      name: plan.name || 'New Plan',
      slug: plan.slug || `plan-${Date.now()}`,
      description: plan.description || '',
      price: plan.price || 9.99,
      currency: plan.currency || 'USD',
      billingCycle: plan.billingCycle || 'monthly',
      trialDays: plan.trialDays || 0,
      setupFee: plan.setupFee || 0,
      tierLevel: plan.tierLevel || 1,
      gracePeriodDays: plan.gracePeriodDays || 5,
      maxRetryAttempts: plan.maxRetryAttempts || 3,
      retryIntervalDays: plan.retryIntervalDays || 3,
      features: plan.features || [],
      isActive: plan.isActive ?? true,
      activeSubscribersCount: 0,
      createdAt: now,
      updatedAt: now
    };
    plans.unshift(updatedPlan);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_PLANS_KEY, JSON.stringify(plans));
    notifySubscriptionBillingChanged();
  }
  return updatedPlan;
}

export function deleteSubscriptionPlan(planId: string): boolean {
  const plans = getSubscriptionPlans();
  const filtered = plans.filter((p) => p.id !== planId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_PLANS_KEY, JSON.stringify(filtered));
    notifySubscriptionBillingChanged();
  }
  return true;
}

// Subscriptions Store
export function getSubscriberSubscriptions(): SubscriberSubscription[] {
  if (typeof window === 'undefined') return DEFAULT_SUBSCRIBER_SUBSCRIPTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_SUBSCRIPTIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SUBSCRIPTIONS_KEY, JSON.stringify(DEFAULT_SUBSCRIBER_SUBSCRIPTIONS));
      return DEFAULT_SUBSCRIBER_SUBSCRIPTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SUBSCRIBER_SUBSCRIPTIONS;
  }
}

export function saveSubscriberSubscription(
  sub: Partial<SubscriberSubscription>
): SubscriberSubscription {
  const subscriptions = getSubscriberSubscriptions();
  const now = new Date().toISOString();

  let updated: SubscriberSubscription;
  const idx = subscriptions.findIndex((s) => s.id === sub.id);

  if (idx !== -1) {
    updated = { ...subscriptions[idx], ...sub, updatedAt: now };
    subscriptions[idx] = updated;
  } else {
    updated = {
      id: sub.id || `sub-${Date.now()}`,
      userId: sub.userId || 'usr-anonymous',
      userName: sub.userName || 'Subscriber',
      userEmail: sub.userEmail || 'subscriber@example.com',
      userAvatar: sub.userAvatar,
      creatorId: sub.creatorId || 'crt-sarah',
      creatorName: sub.creatorName || 'Sarah Jenkins',
      creatorAvatar: sub.creatorAvatar,
      planId: sub.planId || 'plan-pro',
      planName: sub.planName || 'Pro Creator Tier',
      tierLevel: sub.tierLevel || 2,
      amount: sub.amount || 15.0,
      currency: sub.currency || 'USD',
      billingCycle: sub.billingCycle || 'monthly',
      status: sub.status || 'active',
      autoRenew: sub.autoRenew ?? true,
      startDate: sub.startDate || now,
      currentPeriodStart: sub.currentPeriodStart || now,
      currentPeriodEnd: sub.currentPeriodEnd || new Date(Date.now() + 30 * 86400000).toISOString(),
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
      failedAttempts: sub.failedAttempts || 0,
      gatewayId: sub.gatewayId || 'plugin-mock',
      gatewaySubscriptionId: sub.gatewaySubscriptionId || `sub_gw_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    subscriptions.unshift(updated);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
    notifySubscriptionBillingChanged();
  }
  return updated;
}

// Subscription Audit Logs
export function getSubscriptionAuditLogs(): SubscriptionAuditLog[] {
  if (typeof window === 'undefined') return DEFAULT_SUBSCRIPTION_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(DEFAULT_SUBSCRIPTION_LOGS));
      return DEFAULT_SUBSCRIPTION_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SUBSCRIPTION_LOGS;
  }
}

export function logSubscriptionEvent(event: {
  subscriptionId: string;
  subscriberName: string;
  action: SubscriptionAuditLog['action'];
  description: string;
  performedBy: SubscriptionAuditLog['performedBy'];
  gatewayId: string;
  details?: Record<string, any>;
}): SubscriptionAuditLog {
  const logs = getSubscriptionAuditLogs();
  const newLog: SubscriptionAuditLog = {
    id: `sublog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...event
  };
  logs.unshift(newLog);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs.slice(0, 500)));
    notifySubscriptionBillingChanged();
  }
  return newLog;
}

// Gateway Billing Configs Store
export function getGatewayBillingConfigs(): GatewayBillingConfig[] {
  if (typeof window === 'undefined') return DEFAULT_GATEWAY_BILLING_CONFIGS;
  try {
    const raw = localStorage.getItem(STORAGE_GATEWAY_CONFIGS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_GATEWAY_CONFIGS_KEY, JSON.stringify(DEFAULT_GATEWAY_BILLING_CONFIGS));
      return DEFAULT_GATEWAY_BILLING_CONFIGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_GATEWAY_BILLING_CONFIGS;
  }
}

export function saveGatewayBillingConfig(config: GatewayBillingConfig): GatewayBillingConfig {
  const configs = getGatewayBillingConfigs();
  const idx = configs.findIndex((c) => c.gatewayId === config.gatewayId);

  if (idx !== -1) {
    configs[idx] = config;
  } else {
    configs.push(config);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_GATEWAY_CONFIGS_KEY, JSON.stringify(configs));
    notifySubscriptionBillingChanged();
  }
  return config;
}

// Business Logic Operations: Renewal, Retry, Upgrade/Downgrade, Grace Period, Cancellation

/**
 * Triggers an immediate payment retry attempt via payment adapter.
 */
export async function processFailedPaymentRetry(subscriptionId: string): Promise<{
  success: boolean;
  message: string;
  subscription: SubscriberSubscription;
}> {
  const subscriptions = getSubscriberSubscriptions();
  const target = subscriptions.find((s) => s.id === subscriptionId);

  if (!target) {
    throw new Error(`Subscription ${subscriptionId} not found.`);
  }

  // Simulate payment call or gateway check
  const isSuccess = Math.random() > 0.25; // 75% success rate for simulation
  const now = new Date().toISOString();

  if (isSuccess) {
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString();
    const updated = saveSubscriberSubscription({
      id: target.id,
      status: 'active',
      failedAttempts: 0,
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      gracePeriodEnd: undefined,
      lastAttemptAt: now,
      nextRetryAt: undefined
    });

    logSubscriptionEvent({
      subscriptionId: target.id,
      subscriberName: target.userName,
      action: 'RETRY_ATTEMPT',
      description: `Payment retry attempt via ${target.gatewayId} succeeded. Subscription restored to Active.`,
      performedBy: 'admin',
      gatewayId: target.gatewayId,
      details: { amount: target.amount, currency: target.currency }
    });

    return {
      success: true,
      message: `Payment of ${target.currency} $${target.amount.toFixed(2)} charged successfully via ${target.gatewayId}. Subscription is now Active.`,
      subscription: updated
    };
  } else {
    const failedCount = target.failedAttempts + 1;
    const plans = getSubscriptionPlans();
    const plan = plans.find((p) => p.id === target.planId);
    const maxRetries = plan?.maxRetryAttempts || 3;

    let newStatus: SubscriptionStatus = 'in_grace';
    if (failedCount >= maxRetries) {
      newStatus = 'suspended';
    }

    const nextRetryDate = new Date(Date.now() + 2 * 86400000).toISOString();
    const updated = saveSubscriberSubscription({
      id: target.id,
      status: newStatus,
      failedAttempts: failedCount,
      lastAttemptAt: now,
      nextRetryAt: newStatus === 'suspended' ? undefined : nextRetryDate
    });

    logSubscriptionEvent({
      subscriptionId: target.id,
      subscriberName: target.userName,
      action: 'PAYMENT_FAILED',
      description: `Payment retry attempt #${failedCount} via ${target.gatewayId} failed. Status: ${newStatus.toUpperCase()}`,
      performedBy: 'admin',
      gatewayId: target.gatewayId,
      details: { failedAttempts: failedCount, maxRetries }
    });

    return {
      success: false,
      message: `Payment retry failed on ${target.gatewayId} (Card declined/Insufficient balance). Attempt ${failedCount} of ${maxRetries}.`,
      subscription: updated
    };
  }
}

/**
 * Calculates Proration for Plan Upgrades/Downgrades
 */
export function calculateProration(
  subscription: SubscriberSubscription,
  newPlan: SubscriptionPlan
): {
  oldPlanPrice: number;
  newPlanPrice: number;
  daysRemaining: number;
  totalDaysInPeriod: number;
  prorationCredit: number;
  netCharge: number;
  isUpgrade: boolean;
} {
  const now = new Date().getTime();
  const periodStart = new Date(subscription.currentPeriodStart).getTime();
  const periodEnd = new Date(subscription.currentPeriodEnd).getTime();

  const totalDaysInPeriod = Math.max(1, Math.round((periodEnd - periodStart) / (1000 * 3600 * 24)));
  const daysRemaining = Math.max(0, Math.round((periodEnd - now) / (1000 * 3600 * 24)));

  const dailyRateOld = subscription.amount / totalDaysInPeriod;
  const prorationCredit = Math.round(dailyRateOld * daysRemaining * 100) / 100;

  const newPlanPrice = newPlan.price + (newPlan.setupFee || 0);
  const netCharge = Math.max(0, Math.round((newPlanPrice - prorationCredit) * 100) / 100);
  const isUpgrade = newPlan.tierLevel >= subscription.tierLevel;

  return {
    oldPlanPrice: subscription.amount,
    newPlanPrice,
    daysRemaining,
    totalDaysInPeriod,
    prorationCredit,
    netCharge,
    isUpgrade
  };
}

/**
 * Process Plan Upgrade or Downgrade
 */
export function processPlanChange(
  subscriptionId: string,
  newPlanId: string
): {
  subscription: SubscriberSubscription;
  proration: ReturnType<typeof calculateProration>;
} {
  const subscriptions = getSubscriberSubscriptions();
  const target = subscriptions.find((s) => s.id === subscriptionId);
  if (!target) throw new Error(`Subscription ${subscriptionId} not found.`);

  const plans = getSubscriptionPlans();
  const newPlan = plans.find((p) => p.id === newPlanId);
  if (!newPlan) throw new Error(`Plan ${newPlanId} not found.`);

  const proration = calculateProration(target, newPlan);
  const now = new Date().toISOString();
  const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();

  const updated = saveSubscriberSubscription({
    id: target.id,
    planId: newPlan.id,
    planName: newPlan.name,
    tierLevel: newPlan.tierLevel,
    amount: newPlan.price,
    billingCycle: newPlan.billingCycle,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    status: 'active',
    failedAttempts: 0
  });

  logSubscriptionEvent({
    subscriptionId: target.id,
    subscriberName: target.userName,
    action: proration.isUpgrade ? 'UPGRADED' : 'DOWNGRADED',
    description: `Subscription ${proration.isUpgrade ? 'upgraded' : 'downgraded'} from ${target.planName} to ${newPlan.name}. Net charge: $${proration.netCharge} (Prorated Credit: $${proration.prorationCredit})`,
    performedBy: 'admin',
    gatewayId: target.gatewayId,
    details: { proration, newPlanId: newPlan.id }
  });

  return { subscription: updated, proration };
}

/**
 * Grant Grace Period Extension
 */
export function extendGracePeriod(subscriptionId: string, extraDays: number): SubscriberSubscription {
  const subscriptions = getSubscriberSubscriptions();
  const target = subscriptions.find((s) => s.id === subscriptionId);
  if (!target) throw new Error(`Subscription ${subscriptionId} not found.`);

  const currentEnd = target.gracePeriodEnd ? new Date(target.gracePeriodEnd).getTime() : Date.now();
  const newGraceEnd = new Date(currentEnd + extraDays * 86400000).toISOString();

  const updated = saveSubscriberSubscription({
    id: target.id,
    status: 'in_grace',
    gracePeriodEnd: newGraceEnd
  });

  logSubscriptionEvent({
    subscriptionId: target.id,
    subscriberName: target.userName,
    action: 'GRACE_PERIOD_ENTERED',
    description: `Admin extended grace period by ${extraDays} days until ${newGraceEnd.substring(0, 10)}.`,
    performedBy: 'admin',
    gatewayId: target.gatewayId
  });

  return updated;
}
