-- Migration 001_init.sql for Content Scheduling & Auto-Publishing Plugin

CREATE TABLE IF NOT EXISTS public.plugin_scheduled_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'reel', 'story')),
  title TEXT,
  content TEXT NOT NULL,
  media_url TEXT,
  thumbnail_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'subscribers', 'vip_only', 'tier_1', 'tier_2')),
  unlock_price NUMERIC(10, 2) DEFAULT 0.00,
  scheduled_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'publishing', 'published', 'failed_retryable', 'failed', 'cancelled')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  last_error TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.plugin_schedule_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_item_id UUID REFERENCES public.plugin_scheduled_content(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  error_details TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.plugin_scheduled_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_schedule_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow creators to manage own scheduled content" ON public.plugin_scheduled_content
  FOR ALL TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Allow admins full access to scheduled content" ON public.plugin_scheduled_content
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
  ));

CREATE POLICY "Allow creators to view own schedule logs" ON public.plugin_schedule_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Allow admins full access to schedule logs" ON public.plugin_schedule_logs
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
  ));

-- Indexes for efficient worker polling and queue queries
CREATE INDEX IF NOT EXISTS idx_scheduled_content_worker ON public.plugin_scheduled_content(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_creator ON public.plugin_scheduled_content(creator_id, status);
CREATE INDEX IF NOT EXISTS idx_schedule_logs_item ON public.plugin_schedule_logs(scheduled_item_id);
