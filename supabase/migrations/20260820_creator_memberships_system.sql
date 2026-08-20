-- Migration: 20260820_creator_memberships_system.sql
-- Description: Creator Membership Packages, Member Subscriptions, Entitlement Flags, and Deliverable Perks.

-- 1. Create Creator Membership Tiers Table
CREATE TABLE IF NOT EXISTS public.creator_membership_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    price_annual NUMERIC(10, 2) NOT NULL DEFAULT 48.00,
    category TEXT NOT NULL DEFAULT 'Community',
    icon TEXT NOT NULL DEFAULT 'zap',
    color_badge TEXT NOT NULL DEFAULT 'pink',
    description TEXT DEFAULT '',
    benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
    entitlements JSONB NOT NULL DEFAULT '{"can_view_vip_posts": true, "can_download_assets": false, "can_direct_message": false, "has_supporter_badge": true, "can_book_call": false, "can_access_discord": false, "commercial_license": false}'::jsonb,
    member_limit INTEGER,
    active_subscribers_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_popular BOOLEAN NOT NULL DEFAULT false,
    welcome_message TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create Creator Member Subscriptions Table
CREATE TABLE IF NOT EXISTS public.creator_member_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES public.creator_membership_tiers(id) ON DELETE RESTRICT,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_grace', 'past_due', 'cancelled', 'expired')),
    auto_renew BOOLEAN NOT NULL DEFAULT true,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    current_period_end TIMESTAMPTZ NOT NULL,
    last_payment_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create Creator Tier Deliverables (VIP Downloads / Asset Perks)
CREATE TABLE IF NOT EXISTS public.creator_tier_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_id UUID NOT NULL REFERENCES public.creator_membership_tiers(id) ON DELETE CASCADE,
    deliverable_type TEXT NOT NULL DEFAULT 'asset_download' CHECK (deliverable_type IN ('asset_download', 'discord_invite', 'calendar_link', 'access_code', 'custom')),
    title TEXT NOT NULL,
    asset_url TEXT,
    access_code TEXT,
    instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.creator_membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_member_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_tier_deliverables ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Tiers: Anyone can view active tiers; creators can manage their own tiers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'creator_membership_tiers' AND policyname = 'Public can view active membership tiers'
    ) THEN
        CREATE POLICY "Public can view active membership tiers"
            ON public.creator_membership_tiers FOR SELECT
            USING (is_active = true OR auth.uid() = creator_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'creator_membership_tiers' AND policyname = 'Creators can manage own tiers'
    ) THEN
        CREATE POLICY "Creators can manage own tiers"
            ON public.creator_membership_tiers FOR ALL
            USING (auth.uid() = creator_id)
            WITH CHECK (auth.uid() = creator_id);
    END IF;
END
$$;

-- Subscriptions: Users can view own subscriptions; Creators can view their subscribers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'creator_member_subscriptions' AND policyname = 'Users can view their own subscriptions'
    ) THEN
        CREATE POLICY "Users can view their own subscriptions"
            ON public.creator_member_subscriptions FOR SELECT
            USING (auth.uid() = user_id OR auth.uid() = creator_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'creator_member_subscriptions' AND policyname = 'Users can create subscriptions'
    ) THEN
        CREATE POLICY "Users can create subscriptions"
            ON public.creator_member_subscriptions FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- 6. Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_creator_membership_tiers_creator ON public.creator_membership_tiers(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_membership_tiers_active ON public.creator_membership_tiers(is_active);
CREATE INDEX IF NOT EXISTS idx_creator_member_subscriptions_user ON public.creator_member_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_member_subscriptions_creator ON public.creator_member_subscriptions(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_member_subscriptions_tier ON public.creator_member_subscriptions(tier_id);
CREATE INDEX IF NOT EXISTS idx_creator_member_subscriptions_status ON public.creator_member_subscriptions(status);
