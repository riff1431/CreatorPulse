-- Dynamic Referral & Affiliate System Migration

-- 1. referral_settings
CREATE TABLE IF NOT EXISTS public.referral_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    default_commission_rate NUMERIC(5,2) DEFAULT 10.00,
    commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage','fixed')),
    cookie_duration_days INT DEFAULT 30,
    min_payout_amount NUMERIC(10,2) DEFAULT 25.00,
    max_referral_tiers INT DEFAULT 1,
    auto_approve_conversions BOOLEAN DEFAULT false,
    payout_methods TEXT[] DEFAULT ARRAY['bank_transfer','paypal'],
    is_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default settings
INSERT INTO public.referral_settings (id, default_commission_rate, commission_type, cookie_duration_days, min_payout_amount, max_referral_tiers, auto_approve_conversions, payout_methods, is_enabled)
VALUES (1, 10.00, 'percentage', 30, 25.00, 1, false, ARRAY['bank_transfer','paypal'], true)
ON CONFLICT (id) DO NOTHING;

-- 2. referral_campaigns
CREATE TABLE IF NOT EXISTS public.referral_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    commission_rate NUMERIC(5,2) NOT NULL,
    commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage','fixed')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all','creators','members')),
    max_conversions INT,
    total_conversions INT DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','ended')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. referral_links
CREATE TABLE IF NOT EXISTS public.referral_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    campaign_id UUID REFERENCES public.referral_campaigns(id) ON DELETE SET NULL,
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
    click_count INT DEFAULT 0,
    conversion_count INT DEFAULT 0,
    total_earned NUMERIC(12,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. referral_conversions
CREATE TABLE IF NOT EXISTS public.referral_conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_link_id UUID NOT NULL REFERENCES public.referral_links(id) ON DELETE CASCADE,
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.referral_campaigns(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    transaction_amount NUMERIC(12,2) NOT NULL,
    commission_rate NUMERIC(5,2) NOT NULL,
    commission_type TEXT NOT NULL,
    commission_amount NUMERIC(12,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 5. referral_payouts
CREATE TABLE IF NOT EXISTS public.referral_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    processing_fee NUMERIC(10,2) DEFAULT 0.00,
    net_amount NUMERIC(12,2) NOT NULL,
    payout_method TEXT NOT NULL,
    account_details TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.referral_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_payouts ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referral_links_code ON public.referral_links(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_links_user_id ON public.referral_links(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_referrer_id ON public.referral_conversions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_referee_id ON public.referral_conversions(referee_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_status ON public.referral_conversions(status);
CREATE INDEX IF NOT EXISTS idx_referral_payouts_user_id ON public.referral_payouts(user_id);

-- RLS Policies

-- Admin full access based on 'manage_settings' permission
CREATE POLICY "Admins have full access to referral_settings" ON public.referral_settings
    FOR ALL
    USING (public.has_permission(auth.uid(), 'manage_settings'))
    WITH CHECK (public.has_permission(auth.uid(), 'manage_settings'));

CREATE POLICY "Admins have full access to referral_campaigns" ON public.referral_campaigns
    FOR ALL
    USING (public.has_permission(auth.uid(), 'manage_settings'))
    WITH CHECK (public.has_permission(auth.uid(), 'manage_settings'));

CREATE POLICY "Admins have full access to referral_links" ON public.referral_links
    FOR ALL
    USING (public.has_permission(auth.uid(), 'manage_settings'))
    WITH CHECK (public.has_permission(auth.uid(), 'manage_settings'));

CREATE POLICY "Admins have full access to referral_conversions" ON public.referral_conversions
    FOR ALL
    USING (public.has_permission(auth.uid(), 'manage_settings'))
    WITH CHECK (public.has_permission(auth.uid(), 'manage_settings'));

CREATE POLICY "Admins have full access to referral_payouts" ON public.referral_payouts
    FOR ALL
    USING (public.has_permission(auth.uid(), 'manage_settings'))
    WITH CHECK (public.has_permission(auth.uid(), 'manage_settings'));

-- Users SELECT policies
CREATE POLICY "Users can view their own referral links" ON public.referral_links
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own referral conversions" ON public.referral_conversions
    FOR SELECT
    USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can view their own referral payouts" ON public.referral_payouts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view active campaigns" ON public.referral_campaigns
    FOR SELECT
    USING (status = 'active');

CREATE POLICY "Users can view referral settings" ON public.referral_settings
    FOR SELECT
    USING (true);

-- Users INSERT policies
CREATE POLICY "Users can insert their own referral links" ON public.referral_links
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referral payouts" ON public.referral_payouts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
