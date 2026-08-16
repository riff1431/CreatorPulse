import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  ReferralSettings,
  ReferralCampaign,
  ReferralLink,
  ReferralConversion,
  UserReferralEarnings,
  ReferralPayout,
  ReferralAnalytics
} from './types';

// Mock Data Storage for Offline / Fallback Mode
let MOCK_REFERRAL_SETTINGS: ReferralSettings = {
  id: 'settings-1',
  default_commission_rate: 10,
  defaultCommissionRate: 10,
  commission_type: 'percentage',
  defaultCommissionType: 'percentage',
  min_payout_amount: 50,
  minPayoutAmount: 50,
  payout_methods: ['paypal', 'bank_transfer', 'stripe'],
  payoutMethods: ['paypal', 'bank_transfer', 'stripe'],
  cookie_duration_days: 30,
  cookieDurationDays: 30,
  auto_approve_conversions: false,
  autoApproveConversions: false,
  updatedAt: new Date().toISOString()
};

let MOCK_CAMPAIGNS: ReferralCampaign[] = [
  {
    id: 'camp-1',
    name: 'Summer Creator Bonus',
    description: 'Special 15% commission for summer memberships and digital products.',
    commission_rate: 15,
    commissionRate: 15,
    commission_type: 'percentage',
    commissionType: 'percentage',
    status: 'active',
    total_conversions: 24,
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'camp-2',
    name: 'Standard Affiliate Program',
    description: 'Default 10% affiliate program for all creators on the platform.',
    commission_rate: 10,
    commissionRate: 10,
    commission_type: 'percentage',
    commissionType: 'percentage',
    status: 'active',
    total_conversions: 156,
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'camp-3',
    name: 'VIP Launch Event',
    description: 'High fixed commission for VIP course launch referrers.',
    commission_rate: 50,
    commissionRate: 50,
    commission_type: 'fixed',
    commissionType: 'fixed',
    status: 'active',
    total_conversions: 8,
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'camp-4',
    name: 'Holiday Special 2026',
    description: 'Holiday exclusive 20% commission rates.',
    commission_rate: 20,
    commissionRate: 20,
    commission_type: 'percentage',
    commissionType: 'percentage',
    status: 'inactive',
    total_conversions: 0,
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let MOCK_REFERRAL_LINKS: ReferralLink[] = [
  {
    id: 'link-1',
    userId: 'user-1',
    campaignId: 'camp-1',
    code: 'REF-USER-A1B2C3',
    url: 'https://creatorpulse.com/ref/REF-USER-A1B2C3',
    clickCount: 150,
    conversionCount: 5,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'link-2',
    userId: 'user-2',
    campaignId: 'camp-2',
    code: 'REF-ALEX-99X8Y7',
    url: 'https://creatorpulse.com/ref/REF-ALEX-99X8Y7',
    clickCount: 340,
    conversionCount: 12,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'link-3',
    userId: 'user-3',
    campaignId: 'camp-3',
    code: 'REF-SARAH-112233',
    url: 'https://creatorpulse.com/ref/REF-SARAH-112233',
    clickCount: 45,
    conversionCount: 2,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'link-4',
    userId: 'user-1',
    campaignId: 'camp-2',
    code: 'REF-USER-556677',
    url: 'https://creatorpulse.com/ref/REF-USER-556677',
    clickCount: 89,
    conversionCount: 8,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'link-5',
    userId: 'user-4',
    campaignId: 'camp-2',
    code: 'REF-MIKE-445566',
    url: 'https://creatorpulse.com/ref/REF-MIKE-445566',
    clickCount: 21,
    conversionCount: 0,
    isActive: false,
    createdAt: new Date().toISOString()
  }
];

let MOCK_CONVERSIONS: ReferralConversion[] = [
  {
    id: 'conv-1',
    referralLinkId: 'link-1',
    referrerId: 'user-1',
    refereeId: 'user-new-1',
    campaignId: 'camp-1',
    transactionId: 'tx-1001',
    transactionAmount: 100,
    commissionAmount: 15,
    commissionType: 'percentage',
    status: 'approved',
    notes: 'Approved via admin.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'conv-2',
    referralLinkId: 'link-2',
    referrerId: 'user-2',
    refereeId: 'user-new-2',
    campaignId: 'camp-2',
    transactionId: 'tx-1002',
    transactionAmount: 50,
    commissionAmount: 5,
    commissionType: 'percentage',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'conv-3',
    referralLinkId: 'link-2',
    referrerId: 'user-2',
    refereeId: 'user-new-3',
    campaignId: 'camp-2',
    transactionId: 'tx-1003',
    transactionAmount: 150,
    commissionAmount: 15,
    commissionType: 'percentage',
    status: 'approved',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 86400000).toISOString()
  },
  {
    id: 'conv-4',
    referralLinkId: 'link-3',
    referrerId: 'user-3',
    refereeId: 'user-new-4',
    campaignId: 'camp-3',
    transactionId: 'tx-1004',
    transactionAmount: 200,
    commissionAmount: 50,
    commissionType: 'fixed',
    status: 'paid',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 'conv-5',
    referralLinkId: 'link-1',
    referrerId: 'user-1',
    refereeId: 'user-new-5',
    campaignId: 'camp-1',
    transactionId: 'tx-1005',
    transactionAmount: 30,
    commissionAmount: 4.5,
    commissionType: 'percentage',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'conv-6',
    referralLinkId: 'link-1',
    referrerId: 'user-1',
    refereeId: 'user-new-6',
    campaignId: 'camp-1',
    transactionId: 'tx-1006',
    transactionAmount: 80,
    commissionAmount: 12,
    commissionType: 'percentage',
    status: 'rejected',
    notes: 'Fraudulent transaction.',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'conv-7',
    referralLinkId: 'link-2',
    referrerId: 'user-2',
    refereeId: 'user-new-7',
    campaignId: 'camp-2',
    transactionId: 'tx-1007',
    transactionAmount: 120,
    commissionAmount: 12,
    commissionType: 'percentage',
    status: 'paid',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 86400000).toISOString()
  },
  {
    id: 'conv-8',
    referralLinkId: 'link-4',
    referrerId: 'user-1',
    refereeId: 'user-new-8',
    campaignId: 'camp-2',
    transactionId: 'tx-1008',
    transactionAmount: 25,
    commissionAmount: 2.5,
    commissionType: 'percentage',
    status: 'approved',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 'conv-9',
    referralLinkId: 'link-4',
    referrerId: 'user-1',
    refereeId: 'user-new-9',
    campaignId: 'camp-2',
    transactionId: 'tx-1009',
    transactionAmount: 40,
    commissionAmount: 4,
    commissionType: 'percentage',
    status: 'paid',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 55 * 86400000).toISOString()
  },
  {
    id: 'conv-10',
    referralLinkId: 'link-2',
    referrerId: 'user-2',
    refereeId: 'user-new-10',
    campaignId: 'camp-2',
    transactionId: 'tx-1010',
    transactionAmount: 200,
    commissionAmount: 20,
    commissionType: 'percentage',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let MOCK_PAYOUTS: ReferralPayout[] = [
  {
    id: 'pay-1',
    userId: 'user-3',
    amount: 50,
    method: 'paypal',
    accountDetails: 'user3@paypal.com',
    status: 'completed',
    notes: 'Processed on time.',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 'pay-2',
    userId: 'user-2',
    amount: 12,
    method: 'bank_transfer',
    accountDetails: 'IBAN: DE123456789',
    status: 'completed',
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 34 * 86400000).toISOString()
  },
  {
    id: 'pay-3',
    userId: 'user-1',
    amount: 4,
    method: 'stripe',
    accountDetails: 'acct_1Ixxxxxx',
    status: 'completed',
    createdAt: new Date(Date.now() - 55 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 54 * 86400000).toISOString()
  },
  {
    id: 'pay-4',
    userId: 'user-1',
    amount: 17.5,
    method: 'paypal',
    accountDetails: 'user1@paypal.com',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class ReferralEngine {
  // Admin Settings
  static async getSettings(): Promise<ReferralSettings> {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from('referral_settings').select('*').single();
        if (data) return data;
      }
    } catch (e) {
      console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
    }
    return MOCK_REFERRAL_SETTINGS;
  }

  static async updateSettings(data: Partial<ReferralSettings>): Promise<ReferralSettings> {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data: updated, error } = await supabase.from('referral_settings')
          .update({ ...data, updatedAt: new Date().toISOString() })
          .eq('id', MOCK_REFERRAL_SETTINGS.id)
          .select()
          .single();
        if (updated) return updated;
      }
    } catch (e) {
      console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
    }
    MOCK_REFERRAL_SETTINGS = { ...MOCK_REFERRAL_SETTINGS, ...data, updatedAt: new Date().toISOString() };
    return MOCK_REFERRAL_SETTINGS;
  }

  // Campaign Management
  static async getCampaigns(filters?: { status?: string; search?: string }): Promise<ReferralCampaign[]> {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        let query = supabase.from('referral_campaigns').select('*');
        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
        const { data, error } = await query;
        if (data) return data;
      }
    } catch (e) {
      console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
    }
    let result = [...MOCK_CAMPAIGNS];
    if (filters?.status) result = result.filter(c => c.status === filters.status);
    if (filters?.search) result = result.filter(c => c.name.toLowerCase().includes(filters.search!.toLowerCase()));
    return result;
  }

  static async createCampaign(data: Omit<ReferralCampaign, 'id' | 'total_conversions' | 'created_at'>): Promise<ReferralCampaign> {
    const newCampaignData = {
      ...data,
      total_conversions: 0,
    };
    
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data: created } = await supabase.from('referral_campaigns').insert(newCampaignData).select().single();
        if (created) return created as unknown as ReferralCampaign;
      }
    } catch (e) {
      console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
    }
    
    const newCampaign: ReferralCampaign = {
      ...newCampaignData,
      id: `camp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    MOCK_CAMPAIGNS.push(newCampaign);
    return newCampaign;
  }

  static async updateCampaign(id: string, data: Partial<ReferralCampaign>): Promise<ReferralCampaign> {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data: updated } = await supabase.from('referral_campaigns')
          .update({ ...data, updatedAt: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (updated) return updated as unknown as ReferralCampaign;
      }
    } catch (e) {
      console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
    }
    
    const idx = MOCK_CAMPAIGNS.findIndex(c => c.id === id);
    if (idx !== -1) {
      MOCK_CAMPAIGNS[idx] = { ...MOCK_CAMPAIGNS[idx], ...data, updatedAt: new Date().toISOString() };
      return MOCK_CAMPAIGNS[idx];
    }
    throw new Error('Campaign not found');
  }

  static async deleteCampaign(id: string): Promise<void> {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('referral_campaigns').delete().eq('id', id);
        if (!error) return;
      }
    } catch (e) {
      console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
    }
    MOCK_CAMPAIGNS = MOCK_CAMPAIGNS.filter(c => c.id !== id);
  }

  // Referral Links
  static async generateReferralLink(userId: string, campaignId?: string, couponId?: string): Promise<ReferralLink> {
    const shortUserId = userId.slice(0, 4).toUpperCase() || 'USER';
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `REF-${shortUserId}-${randomChars}`;
    
    const linkData: Partial<ReferralLink> = {
      userId,
      user_id: userId,
      campaignId,
      campaign_id: campaignId,
      couponId,
      coupon_id: couponId,
      code,
      referral_code: code,
      url: `https://creatorpulse.com/ref/${code}`,
      clickCount: 0,
      click_count: 0,
      conversionCount: 0,
      conversion_count: 0,
      isActive: true,
      is_active: true,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data } = await supabase.from('referral_links').insert(linkData).select().single();
        if (data) return data as unknown as ReferralLink;
      }
    } catch (e) {
      console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
    }
    
    const newLink: ReferralLink = {
      ...linkData,
      id: `link-${Date.now()}`,
    };
    MOCK_REFERRAL_LINKS.push(newLink);
    return newLink;
  }

  static async getUserReferralLinks(userId: string): Promise<ReferralLink[]> {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data } = await supabase.from('referral_links').select('*').or(`user_id.eq.${userId},userId.eq.${userId}`);
        if (data) return data as unknown as ReferralLink[];
      }
    } catch (e) {
      console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
    }
    return MOCK_REFERRAL_LINKS.filter(l => l.userId === userId || l.user_id === userId);
  }

  static async toggleLinkActive(linkId: string, isActive: boolean): Promise<void> {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('referral_links').update({ is_active: isActive, isActive }).eq('id', linkId);
        if (!error) return;
      }
    } catch (e) {
      console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
    }
    const idx = MOCK_REFERRAL_LINKS.findIndex(l => l.id === linkId);
    if (idx !== -1) {
      MOCK_REFERRAL_LINKS[idx].isActive = isActive;
      MOCK_REFERRAL_LINKS[idx].is_active = isActive;
    }
  }

  // Tracking
  static async trackClick(referralCode: string): Promise<{ success: boolean; redirectUrl: string }> {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data: link } = await supabase.from('referral_links').select('*').or(`code.eq.${referralCode},referral_code.eq.${referralCode}`).single();
        if (link) {
          const currentCount = link.clickCount || link.click_count || 0;
          await supabase.from('referral_links').update({ clickCount: currentCount + 1, click_count: currentCount + 1 }).eq('id', link.id);
          return { success: true, redirectUrl: link.url || '/' };
        }
      }
    } catch (e) {
      console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
    }
    
    const link = MOCK_REFERRAL_LINKS.find(l => l.code === referralCode || l.referral_code === referralCode);
    if (link) {
      link.clickCount = (link.clickCount || 0) + 1;
      link.click_count = link.clickCount;
      return { success: true, redirectUrl: link.url || '/' };
    }
    return { success: false, redirectUrl: '/' };
  }

  static async recordConversion(params: { referralCode: string; refereeId: string; transactionId: string; transactionAmount: number }): Promise<ReferralConversion> {
    let link: ReferralLink | undefined;
    let campaign: ReferralCampaign | undefined;
    const settings = await this.getSettings();
    
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data } = await supabase.from('referral_links').select('*').or(`code.eq.${params.referralCode},referral_code.eq.${params.referralCode}`).single();
        if (data) {
          link = data as unknown as ReferralLink;
          const linkCampId = link ? (link.campaignId || link.campaign_id) : undefined;
          if (linkCampId) {
            const { data: campData } = await supabase.from('referral_campaigns').select('*').eq('id', linkCampId).single();
            if (campData) campaign = campData as unknown as ReferralCampaign;
          }
        }
      }
    } catch (e) {
      console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
    }
    
    if (!link) {
      link = MOCK_REFERRAL_LINKS.find(l => l.code === params.referralCode || l.referral_code === params.referralCode);
      if (link) {
        const linkCampId = link.campaignId || link.campaign_id;
        if (linkCampId) {
          campaign = MOCK_CAMPAIGNS.find(c => c.id === linkCampId);
        }
      }
    }
    
    if (!link) {
      throw new Error('Invalid referral code');
    }
    
    const commissionRate = campaign?.commissionRate ?? campaign?.commission_rate ?? settings.defaultCommissionRate ?? settings.default_commission_rate ?? 10;
    const commissionType = campaign?.commissionType ?? campaign?.commission_type ?? settings.defaultCommissionType ?? settings.commission_type ?? 'percentage';
    let commissionAmount = 0;
    
    if (commissionType === 'percentage') {
      commissionAmount = (params.transactionAmount * commissionRate) / 100;
    } else {
      commissionAmount = commissionRate;
    }
    
    const conversionData: Partial<ReferralConversion> = {
      referralLinkId: link.id,
      referral_link_id: link.id,
      referrerId: link.userId || link.user_id,
      referrer_id: link.userId || link.user_id,
      refereeId: params.refereeId,
      referee_id: params.refereeId,
      campaignId: link.campaignId || link.campaign_id,
      campaign_id: link.campaignId || link.campaign_id,
      transactionId: params.transactionId,
      transaction_id: params.transactionId,
      transactionAmount: params.transactionAmount,
      transaction_amount: params.transactionAmount,
      commissionAmount,
      commission_amount: commissionAmount,
      commissionType,
      commission_type: commissionType,
      status: (settings.autoApproveConversions ?? settings.auto_approve_conversions) ? 'approved' : 'pending',
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data } = await supabase.from('referral_conversions').insert(conversionData).select().single();
        if (data) return data as unknown as ReferralConversion;
      }
    } catch (e) {
      console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
    }
    
    const newConversion: ReferralConversion = {
      ...conversionData,
      id: `conv-${Date.now()}`
    } as ReferralConversion;
    
    MOCK_CONVERSIONS.push(newConversion);
    if (link) {
      link.conversionCount = (link.conversionCount || 0) + 1;
      link.conversion_count = link.conversionCount;
    }
    
    return newConversion;
  }


  // Conversions
  static async getConversions(filters?: { status?: string; referrerId?: string; search?: string; page?: number; limit?: number }): Promise<{ conversions: ReferralConversion[]; total: number }> {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        let query = supabase.from('referral_conversions').select('*', { count: 'exact' });
        
        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.referrerId) query = query.or(`referrer_id.eq.${filters.referrerId},referrerId.eq.${filters.referrerId}`);
        
        if (filters?.page && filters?.limit) {
           const from = (filters.page - 1) * filters.limit;
           const to = from + filters.limit - 1;
           query = query.range(from, to);
        }
        
        const { data, count } = await query;
        if (data) return { conversions: data as unknown as ReferralConversion[], total: count || data.length };
      }
    } catch (e) {
      console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
    }
    
    let result = [...MOCK_CONVERSIONS];
    if (filters?.status) result = result.filter(c => c.status === filters.status);
    if (filters?.referrerId) result = result.filter(c => c.referrerId === filters.referrerId || c.referrer_id === filters.referrerId);
    
    const total = result.length;
    if (filters?.page && filters?.limit) {
      const start = (filters.page - 1) * filters.limit;
      result = result.slice(start, start + filters.limit);
    }
    
    return { conversions: result, total };
  }

  static async updateConversionStatus(id: string, status: string, notes?: string): Promise<void> {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('referral_conversions')
          .update({ status, notes, updated_at: new Date().toISOString(), updatedAt: new Date().toISOString() })
          .eq('id', id);
        if (!error) return;
      }
    } catch (e) {
      console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
    }
    
    const idx = MOCK_CONVERSIONS.findIndex(c => c.id === id);
    if (idx !== -1) {
      MOCK_CONVERSIONS[idx].status = status as any;
      if (notes) MOCK_CONVERSIONS[idx].notes = notes;
      MOCK_CONVERSIONS[idx].updatedAt = new Date().toISOString();
    }
  }

  static async bulkUpdateConversions(ids: string[], status: string): Promise<void> {
     try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('referral_conversions')
          .update({ status, updated_at: new Date().toISOString() })
          .in('id', ids);
        if (!error) return;
      }
    } catch (e) {
      console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
    }
    
    MOCK_CONVERSIONS.forEach(c => {
      if (ids.includes(c.id)) {
        c.status = status as any;
        c.updatedAt = new Date().toISOString();
      }
    });
  }

  // Earnings
  static async getUserEarnings(userId: string): Promise<UserReferralEarnings> {
     let userConversions: ReferralConversion[] = [];
     try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data } = await supabase.from('referral_conversions').select('*').or(`referrer_id.eq.${userId},referrerId.eq.${userId}`);
        if (data) {
          userConversions = data as unknown as ReferralConversion[];
        }
      }
     } catch (e) {
        console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
     }
     
     if (userConversions.length === 0) {
       userConversions = MOCK_CONVERSIONS.filter(c => c.referrerId === userId || c.referrer_id === userId);
     }
     
     const earnings: UserReferralEarnings = {
       userId,
       totalEarned: 0,
       pendingAmount: 0,
       pendingCommission: 0,
       approvedAmount: 0,
       approvedCommission: 0,
       paidAmount: 0,
       paidCommission: 0,
       availableForPayout: 0,
       totalReferrals: userConversions.length,
       totalClicks: 0,
       conversionRate: 0
     };
     
     userConversions.forEach(c => {
        const amt = c.commissionAmount || c.commission_amount || 0;
        earnings.totalEarned += amt;
        if (c.status === 'pending') {
          earnings.pendingAmount = (earnings.pendingAmount || 0) + amt;
          earnings.pendingCommission = earnings.pendingAmount;
        }
        if (c.status === 'approved') {
          earnings.approvedAmount = (earnings.approvedAmount || 0) + amt;
          earnings.approvedCommission = earnings.approvedAmount;
        }
        if (c.status === 'paid') {
          earnings.paidAmount = (earnings.paidAmount || 0) + amt;
          earnings.paidCommission = earnings.paidAmount;
        }
     });
     
     earnings.availableForPayout = earnings.approvedAmount || 0;
     return earnings;
  }

  // Payouts
  static async requestPayout(userId: string, amount: number, payoutMethod: string, accountDetails?: string): Promise<ReferralPayout> {
     const settings = await this.getSettings();
     const earnings = await this.getUserEarnings(userId);
     
     if (amount > earnings.availableForPayout) {
       throw new Error('Requested amount exceeds available earnings');
     }
     
     const minAmt = settings.minPayoutAmount || settings.min_payout_amount || 50;
     if (amount < minAmt) {
       throw new Error(`Minimum payout amount is $${minAmt}`);
     }
     
     const payoutData: Partial<ReferralPayout> = {
       userId,
       user_id: userId,
       amount,
       method: payoutMethod,
       payout_method: payoutMethod,
       payoutMethod: payoutMethod,
       accountDetails,
       account_details: accountDetails,
       status: 'pending',
       created_at: new Date().toISOString(),
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString()
     };
     
     try {
       const supabase = await createServerSupabaseClient();
       if (supabase) {
         const { data } = await supabase.from('referral_payouts').insert(payoutData).select().single();
         if (data) {
            return data as unknown as ReferralPayout;
         }
       }
     } catch (e) {
       console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
     }
     
     const newPayout: ReferralPayout = {
       ...payoutData,
       id: `pay-${Date.now()}`,
       amount,
       status: 'pending'
     } as ReferralPayout;
     
     MOCK_PAYOUTS.push(newPayout);
     return newPayout;
  }

  static async getUserPayouts(userId: string): Promise<ReferralPayout[]> {
    try {
       const supabase = await createServerSupabaseClient();
       if (supabase) {
         const { data } = await supabase.from('referral_payouts').select('*').or(`user_id.eq.${userId},userId.eq.${userId}`);
         if (data) return data as unknown as ReferralPayout[];
       }
     } catch (e) {
       console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
     }
     return MOCK_PAYOUTS.filter(p => p.userId === userId || p.user_id === userId);
  }

  static async getAllPayouts(filters?: { status?: string }): Promise<ReferralPayout[]> {
     try {
       const supabase = await createServerSupabaseClient();
       if (supabase) {
         let query = supabase.from('referral_payouts').select('*');
         if (filters?.status) query = query.eq('status', filters.status);
         const { data } = await query;
         if (data) return data as unknown as ReferralPayout[];
       }
     } catch (e) {
       console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
     }
     
     if (filters?.status) return MOCK_PAYOUTS.filter(p => p.status === filters.status);
     return [...MOCK_PAYOUTS];
  }

  static async processPayoutAdmin(payoutId: string, action: 'approved' | 'rejected' | 'completed', notes?: string): Promise<void> {
     try {
       const supabase = await createServerSupabaseClient();
       if (supabase) {
         const { error } = await supabase.from('referral_payouts')
           .update({ status: action, notes, admin_notes: notes, updated_at: new Date().toISOString(), updatedAt: new Date().toISOString() })
           .eq('id', payoutId);
         if (!error) return;
       }
     } catch (e) {
       console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
     }
     
     const idx = MOCK_PAYOUTS.findIndex(p => p.id === payoutId);
     if (idx !== -1) {
       MOCK_PAYOUTS[idx].status = action;
       if (notes) {
         MOCK_PAYOUTS[idx].notes = notes;
         MOCK_PAYOUTS[idx].admin_notes = notes;
       }
       MOCK_PAYOUTS[idx].updatedAt = new Date().toISOString();
     }
  }

  // Analytics
  static async getAdminAnalytics(): Promise<ReferralAnalytics> {
     let allConversions = [...MOCK_CONVERSIONS];
     let allCampaigns = [...MOCK_CAMPAIGNS];
     let allLinks = [...MOCK_REFERRAL_LINKS];
     
     try {
       const supabase = await createServerSupabaseClient();
       if (supabase) {
         const [convData, campData, linkData] = await Promise.all([
           supabase.from('referral_conversions').select('*'),
           supabase.from('referral_campaigns').select('id'),
           supabase.from('referral_links').select('id')
         ]);
         
         if (convData.data) allConversions = convData.data;
         if (campData.data) allCampaigns = campData.data as any;
         if (linkData.data) allLinks = linkData.data as any;
       }
     } catch (e) {
        console.warn('[ReferralEngine] Supabase failed, using mock data:', e);
     }
     
     const totalCampaigns = allCampaigns.length;
     const totalLinks = allLinks.length;
     const totalConversions = allConversions.length;
     
     let totalRevenue = 0;
     let totalCommission = 0;
     let pendingCommission = 0;
     let paidCommission = 0;
     
     allConversions.forEach(c => {
       const rev = c.transactionAmount || c.transaction_amount || 0;
       const comm = c.commissionAmount || c.commission_amount || 0;
       totalRevenue += rev;
       totalCommission += comm;
       
       if (c.status === 'pending') pendingCommission += comm;
       if (c.status === 'paid') paidCommission += comm;
     });
     
     return {
       totalCampaigns,
       totalLinks,
       totalConversions,
       totalRevenue,
       totalCommission,
       pendingCommission,
       paidCommission
     };
  }
}
