-- ============================================================================
-- CREATORPULSE: DYNAMIC ADMIN MANAGERS MIGRATION (5 SYSTEMS)
-- ============================================================================

-- 1. DYNAMIC SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Single row configuration
    site_name TEXT NOT NULL DEFAULT 'CreatorPulse',
    tagline TEXT DEFAULT 'A premium creator membership and community platform.',
    logo_url TEXT DEFAULT '',
    favicon_url TEXT DEFAULT '',
    contact_email TEXT DEFAULT 'support@creatorpulse.com',
    contact_phone TEXT DEFAULT '+1 (555) 234-5678',
    contact_address TEXT DEFAULT '100 Innovation Way, San Francisco, CA 94105',
    copyright_text TEXT DEFAULT '© 2026 CreatorPulse Inc. All rights reserved.',
    social_links JSONB DEFAULT '{"twitter": "https://x.com", "instagram": "https://instagram.com", "youtube": "https://youtube.com", "discord": "https://discord.gg", "github": "https://github.com", "linkedin": "https://linkedin.com", "telegram": "https://t.me"}'::jsonb,
    seo_defaults JSONB DEFAULT '{"meta_title_template": "%s | CreatorPulse", "default_meta_description": "Join top creators and build your membership community with CreatorPulse.", "default_meta_keywords": "creator, membership, subscription, community, monetize", "og_image_url": "", "twitter_handle": "@creatorpulse", "canonical_domain": "https://creatorpulse.com"}'::jsonb,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_title TEXT DEFAULT 'We will be back shortly!',
    maintenance_message TEXT DEFAULT 'CreatorPulse is undergoing scheduled system maintenance to bring you exciting improvements.',
    registration_mode TEXT DEFAULT 'open' CHECK (registration_mode IN ('open', 'invite_only', 'closed')),
    default_user_role TEXT DEFAULT 'member' CHECK (default_user_role IN ('member', 'creator')),
    require_email_verification BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed initial site settings
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 2. DYNAMIC NAVIGATION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.navigation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location TEXT NOT NULL CHECK (location IN ('header', 'footer', 'sidebar')),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT, -- Lucide icon key string e.g. 'Home', 'Compass', 'Star'
    target TEXT DEFAULT '_self' CHECK (target IN ('_self', '_blank')),
    parent_id UUID REFERENCES public.navigation_items(id) ON DELETE CASCADE,
    order_index INT DEFAULT 0 NOT NULL,
    allowed_roles TEXT[] DEFAULT ARRAY['all']::TEXT[],
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. DYNAMIC CMS PAGES TABLE
CREATE TABLE IF NOT EXISTS public.cms_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    og_image TEXT,
    sections JSONB DEFAULT '[]'::jsonb NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. DYNAMIC ANNOUNCEMENTS & NOTIFICATION TEMPLATES TABLES
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_role TEXT DEFAULT 'all' CHECK (target_role IN ('all', 'member', 'creator', 'admin')),
    placement TEXT DEFAULT 'top_banner' CHECK (placement IN ('top_banner', 'popup_modal', 'notification_feed')),
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'archived')),
    published_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    cta_text TEXT,
    cta_link TEXT,
    is_dismissible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.announcement_reads (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, announcement_id)
);

CREATE TABLE IF NOT EXISTS public.notification_templates (
    id TEXT PRIMARY KEY, -- e.g. 'welcome_email', 'payout_approved', 'report_resolved'
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    variables TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed default notification templates
INSERT INTO public.notification_templates (id, name, subject, body, variables, is_enabled) VALUES
('welcome_user', 'Welcome New Member', 'Welcome to {{platform_name}}!', 'Hi {{user_name}},\n\nThank you for joining {{platform_name}}. Explore top creators and unlock exclusive content.', ARRAY['user_name', 'platform_name'], true),
('payout_approved', 'Payout Approved', 'Your payout request of ${{amount}} has been approved', 'Hi {{creator_name}},\n\nYour payout request of ${{amount}} was processed successfully via {{payout_method}}.', ARRAY['creator_name', 'amount', 'payout_method'], true),
('report_resolved', 'Report Resolved', 'Update on your reported content', 'Hi {{user_name}},\n\nOur moderation team reviewed your report and took appropriate action.', ARRAY['user_name'], true)
ON CONFLICT (id) DO NOTHING;

-- 5. DYNAMIC FEATURE MODULES TABLE
CREATE TABLE IF NOT EXISTS public.feature_modules (
    id TEXT PRIMARY KEY, -- 'stories', 'reels', 'messaging', 'memberships', 'comments', 'creator_applications', 'wallet'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
    settings JSONB DEFAULT '{}'::jsonb NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed default feature modules
INSERT INTO public.feature_modules (id, name, description, is_enabled, dependencies, settings) VALUES
('stories', '24h Stories', 'Allow creators to publish 24-hour expiring media stories.', true, ARRAY[]::TEXT[], '{"max_story_seconds": 30}'),
('reels', 'Shorts & Reels', 'Vertical video feed with interactions and audio background support.', true, ARRAY[]::TEXT[], '{"max_video_mb": 100}'),
('messaging', 'Direct Messaging', '1-on-1 private messaging and paywalled direct messages.', true, ARRAY[]::TEXT[], '{"allow_paywall": true}'),
('memberships', 'VIP Memberships', 'Creator tier subscriptions and exclusive subscriber content.', true, ARRAY['wallet']::TEXT[], '{"min_price": 1}'),
('comments', 'Post & Reel Comments', 'Interactive comment sections on public and subscriber posts.', true, ARRAY[]::TEXT[], '{"allow_gif": true}'),
('creator_applications', 'Creator Onboarding', 'Fan-to-Creator upgrade application process and review pipeline.', true, ARRAY[]::TEXT[], '{"auto_approve": false}'),
('wallet', 'Virtual Wallet & Payouts', 'User balance, top-ups, tip support, and payout processing.', true, ARRAY[]::TEXT[], '{"min_payout": 50}')
ON CONFLICT (id) DO NOTHING;
