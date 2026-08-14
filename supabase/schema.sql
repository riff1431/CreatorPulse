-- ============================================================================
-- CREATORPULSE: FULL PRD SUPABASE POSTGRESQL SCHEMA & RLS POLICIES (25 TABLES)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM TYPES & ROLE TABLES
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY, -- 'admin', 'creator', 'member', etc.
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_builtin BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Prepopulate built-in roles
INSERT INTO public.roles (id, name, description, permissions, is_builtin, status) VALUES
('super_admin', 'Super Admin', 'Root system administrator with absolute ownership over all permissions.', '{"view_dashboard": true, "manage_users": true, "manage_roles": true, "manage_content": true, "moderate_reports": true, "manage_settings": true, "view_audit_logs": true}', true, 'active'),
('admin', 'Admin', 'Administrative console privileges, user and content management.', '{"view_dashboard": true, "manage_users": true, "manage_roles": false, "manage_content": true, "moderate_reports": true, "manage_settings": true, "view_audit_logs": true}', true, 'active'),
('moderator', 'Moderator', 'Moderation dashboard privileges, handles content reports and flags.', '{"view_dashboard": true, "manage_content": false, "moderate_reports": true, "manage_users": false, "manage_roles": false, "manage_settings": false, "view_audit_logs": false}', true, 'active'),
('creator', 'Creator', 'Can publish posts, reels, stories, and manage subscription plans.', '{"view_dashboard": true, "manage_content": true, "moderate_reports": false, "manage_users": false, "manage_roles": false, "manage_settings": false, "view_audit_logs": false}', true, 'active'),
('member', 'Member', 'Standard fan account that can view and subscribe to creators.', '{"view_dashboard": false, "manage_content": false, "moderate_reports": false, "manage_users": false, "manage_roles": false, "manage_settings": false, "view_audit_logs": false}', true, 'active')
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    CREATE TYPE post_type AS ENUM ('text', 'image', 'video', 'short', 'audio', 'poll');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE visibility_tier AS ENUM ('public', 'followers', 'subscribers', 'members_only', 'vip_only', 'private');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('pending', 'under_review', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payout_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('top_up', 'membership', 'subscription', 'tip_support', 'premium_unlock', 'payout');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    cover_url TEXT,
    bio TEXT,
    role_id TEXT DEFAULT 'member' REFERENCES public.roles(id) ON DELETE RESTRICT,
    is_verified BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Granular permission function for RLS
CREATE OR REPLACE FUNCTION public.has_permission(usr_id UUID, perm TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  SELECT (r.permissions->>perm)::boolean INTO has_perm
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = usr_id AND r.status = 'active';
  
  RETURN COALESCE(has_perm, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Roles & permissions audit log
CREATE TABLE IF NOT EXISTS public.roles_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    action TEXT NOT NULL, -- 'ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DELETED', 'ROLE_ASSIGNED', 'ROLE_STATUS_TOGGLED'
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    target_id TEXT, -- role id or user id
    target_name TEXT,
    details TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'success', 'warning', 'error')),
    ip_address TEXT,
    user_agent TEXT
);

-- 3. CREATOR PROFILES
CREATE TABLE IF NOT EXISTS public.creator_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    headline TEXT,
    category TEXT DEFAULT 'General',
    follower_count INT DEFAULT 0,
    subscriber_count INT DEFAULT 0,
    starting_price NUMERIC(10, 2) DEFAULT 5.00,
    total_revenue NUMERIC(12, 2) DEFAULT 0.00,
    available_earnings NUMERIC(12, 2) DEFAULT 0.00,
    pending_earnings NUMERIC(12, 2) DEFAULT 0.00,
    payout_method TEXT DEFAULT 'Bank Transfer',
    payout_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. MEMBERSHIP PLANS
CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. Starter, Premium, VIP
    price_monthly NUMERIC(10, 2) NOT NULL,
    description TEXT,
    benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
    duration_months INT DEFAULT 1 CHECK (duration_months IN (1, 3, 6, 12)),
    amount NUMERIC(10, 2) NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    UNIQUE(member_id, creator_id)
);

-- 6. FOLLOWS
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (follower_id, following_id)
);

-- 7. POSTS & POLLS
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    post_type post_type DEFAULT 'text'::post_type NOT NULL,
    media_urls TEXT[],
    audio_url TEXT,
    visibility visibility_tier DEFAULT 'public'::visibility_tier NOT NULL,
    unlock_price NUMERIC(10, 2) DEFAULT 0.00,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID UNIQUE NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- e.g. [{"id": "opt1", "text": "Option 1", "votes": 0}]
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. REELS (VERTICAL SHORT VIDEOS)
CREATE TABLE IF NOT EXISTS public.reels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    category TEXT DEFAULT 'General',
    hashtags TEXT[],
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    visibility visibility_tier DEFAULT 'public'::visibility_tier NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. STORIES & STORY VIEWS
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    caption TEXT,
    visibility visibility_tier DEFAULT 'public'::visibility_tier NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours') NOT NULL
);

CREATE TABLE IF NOT EXISTS public.story_views (
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (story_id, viewer_id)
);

-- 10. LIKES, COMMENTS & BOOKMARKS
CREATE TABLE IF NOT EXISTS public.likes (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bookmarks (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. MESSAGING & CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(participant1_id, participant2_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    audio_url TEXT,
    is_paywalled BOOLEAN DEFAULT FALSE,
    unlock_price NUMERIC(10, 2) DEFAULT 0.00,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. BALANCES, TRANSACTIONS & PAYOUTS
CREATE TABLE IF NOT EXISTS public.balances (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    available_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    pending_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total_spent NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    creator_net NUMERIC(12, 2) NOT NULL,
    tx_type transaction_type NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    processing_fee NUMERIC(10, 2) DEFAULT 0.00,
    payout_method TEXT NOT NULL,
    account_details TEXT NOT NULL,
    status payout_status DEFAULT 'pending'::payout_status NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMPTZ
);

-- 13. NOTIFICATIONS, CREATOR APPLICATIONS & REPORTS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.creator_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    creator_name TEXT NOT NULL,
    category TEXT NOT NULL,
    country TEXT,
    portfolio_url TEXT,
    payout_info TEXT,
    reason TEXT NOT NULL,
    status application_status DEFAULT 'pending'::application_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status report_status DEFAULT 'pending'::report_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public posts read" ON public.posts FOR SELECT USING (visibility = 'public' OR author_id = auth.uid());
CREATE POLICY "Public reels read" ON public.reels FOR SELECT USING (visibility = 'public' OR author_id = auth.uid());

-- Profiles UPDATE policy: prevent self-role spoofing and status overrides
CREATE POLICY "Users can update their own profile fields except role and status"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id AND status = 'active')
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role_id IN ('admin', 'super_admin')
    )
    OR
    (
      role_id = (SELECT role_id FROM public.profiles WHERE id = auth.uid())
      AND
      status = (SELECT status FROM public.profiles WHERE id = auth.uid())
    )
  );

-- 15. AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role TEXT := 'member';
  user_full_name TEXT;
  user_username TEXT;
BEGIN
  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'fullName', 'New User');
  user_username := COALESCE(
    new.raw_user_meta_data->>'username',
    SPLIT_PART(new.email, '@', 1) || '_' || FLOOR(RANDOM() * 1000)::TEXT
  );
  
  -- Prevent role spoofing from signup client metadata (only member or creator allowed)
  IF new.raw_user_meta_data->>'role' = 'creator' THEN
    default_role := 'creator';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, username, role_id, is_verified, status)
  VALUES (
    new.id,
    new.email,
    user_full_name,
    user_username,
    default_role,
    FALSE,
    'active'
  );

  -- If creator, create creator profile
  IF default_role = 'creator' THEN
    INSERT INTO public.creator_profiles (id, headline, category)
    VALUES (new.id, 'New Creator on CreatorPulse', 'General');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
