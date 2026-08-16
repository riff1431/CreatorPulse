export interface ReferralSettings {
  id: number | string;
  default_commission_rate: number;
  defaultCommissionRate?: number;
  commission_type?: 'percentage' | 'fixed';
  defaultCommissionType?: 'percentage' | 'fixed';
  cookie_duration_days: number;
  cookieDurationDays?: number;
  min_payout_amount: number;
  minPayoutAmount?: number;
  max_referral_tiers?: number;
  auto_approve_conversions: boolean;
  autoApproveConversions?: boolean;
  payout_methods: string[];
  payoutMethods?: string[];
  is_enabled?: boolean;
  updated_at?: string;
  updatedAt?: string;
}

export interface ReferralCampaign {
  id: string;
  name: string;
  description: string | null;
  commission_rate: number;
  commissionRate?: number;
  commission_type: 'percentage' | 'fixed';
  commissionType?: 'percentage' | 'fixed';
  start_date?: string | null;
  end_date?: string | null;
  coupon_id?: string | null;
  target_audience?: 'all' | 'creators' | 'members';
  max_conversions?: number | null;
  total_conversions: number;
  status: 'active' | 'paused' | 'ended' | 'inactive';
  created_at: string;
  updatedAt?: string;
}

export interface ReferralLink {
  id: string;
  user_id?: string;
  userId?: string;
  referral_code?: string;
  code?: string;
  url?: string;
  campaign_id?: string | null;
  campaignId?: string | null;
  coupon_id?: string | null;
  couponId?: string | null;
  click_count?: number;
  clickCount?: number;
  conversion_count?: number;
  conversionCount?: number;
  total_earned?: number;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  createdAt?: string;
}

export interface ReferralConversion {
  id: string;
  referral_link_id?: string;
  referralLinkId?: string;
  referrer_id?: string;
  referrerId?: string;
  referee_id?: string;
  refereeId?: string;
  campaign_id?: string | null;
  campaignId?: string | null;
  transaction_id?: string | null;
  transactionId?: string | null;
  transaction_amount?: number;
  transactionAmount?: number;
  commission_rate?: number;
  commissionRate?: number;
  commission_type?: string;
  commissionType?: string;
  commission_amount?: number;
  commissionAmount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  notes?: string | null;
  created_at?: string;
  createdAt?: string;
  processed_at?: string | null;
  updatedAt?: string;
}

export interface ReferralPayout {
  id: string;
  user_id?: string;
  userId?: string;
  amount: number;
  processing_fee?: number;
  processingFee?: number;
  net_amount?: number;
  netAmount?: number;
  payout_method?: string;
  payoutMethod?: string;
  method?: string;
  account_details?: string | null;
  accountDetails?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string | null;
  notes?: string | null;
  created_at?: string;
  createdAt?: string;
  processed_at?: string | null;
  updatedAt?: string;
}

export interface TopAffiliate {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  totalEarned: number;
  totalConversions: number;
  conversionRate: number;
}

export interface ReferralAnalytics {
  totalAffiliates?: number;
  activeCampaigns?: number;
  totalCampaigns?: number;
  totalLinks?: number;
  totalClicks?: number;
  totalConversions?: number;
  totalRevenue?: number;
  totalCommission?: number;
  totalCommissionPaid?: number;
  totalCommissionPending?: number;
  pendingCommission?: number;
  paidCommission?: number;
  conversionRate?: number;
  avgCommission?: number;
  topAffiliates?: TopAffiliate[];
  recentConversions?: ReferralConversion[];
}

export interface UserReferralEarnings {
  userId?: string;
  totalEarned: number;
  pendingCommission?: number;
  pendingAmount?: number;
  approvedCommission?: number;
  approvedAmount?: number;
  paidCommission?: number;
  paidAmount?: number;
  availableForPayout: number;
  totalReferrals?: number;
  totalClicks?: number;
  conversionRate?: number;
}
