-- ============================================================================
-- CREATORPULSE: DYNAMIC EMAIL & SMTP MANAGER MIGRATION
-- ============================================================================

-- 1. SMTP PROVIDERS TABLE
-- Stores all configured email delivery providers with credentials and routing config.
CREATE TABLE IF NOT EXISTS public.smtp_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identity
    name TEXT NOT NULL,                  -- Friendly name, e.g. "Primary Gmail SMTP"
    provider TEXT NOT NULL DEFAULT 'custom'
        CHECK (provider IN ('gmail', 'outlook', 'sendgrid', 'mailgun', 'ses', 'resend', 'custom')),

    -- SMTP Connection
    host TEXT NOT NULL DEFAULT '',
    port INT NOT NULL DEFAULT 587,
    encryption TEXT NOT NULL DEFAULT 'tls'
        CHECK (encryption IN ('none', 'tls', 'ssl')),
    username TEXT NOT NULL DEFAULT '',
    password TEXT NOT NULL DEFAULT '',   -- Stored as-is; mask in UI

    -- Sender Identity
    from_name TEXT NOT NULL DEFAULT 'CreatorPulse',
    from_email TEXT NOT NULL DEFAULT 'noreply@creatorpulse.com',
    reply_to TEXT DEFAULT NULL,

    -- API Keys (for API-based providers: SendGrid, Mailgun, Resend, SES)
    api_key TEXT DEFAULT NULL,
    api_region TEXT DEFAULT NULL,        -- e.g. 'us-east-1' for SES, 'eu' for Mailgun

    -- Routing & Status
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    is_fallback BOOLEAN NOT NULL DEFAULT FALSE,
    priority INT NOT NULL DEFAULT 0,     -- Lower = higher priority in fallback chain

    -- Health Check
    last_tested_at TIMESTAMPTZ DEFAULT NULL,
    last_test_status TEXT DEFAULT NULL
        CHECK (last_test_status IN ('ok', 'fail', NULL)),
    last_test_message TEXT DEFAULT NULL,
    last_test_latency_ms INT DEFAULT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default index for active provider lookups
CREATE INDEX IF NOT EXISTS idx_smtp_providers_active
    ON public.smtp_providers (is_active, priority);

-- 2. EMAIL DELIVERY LOGS TABLE
-- Append-only log of every email dispatch attempt through the system.
CREATE TABLE IF NOT EXISTS public.email_delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    provider_id UUID REFERENCES public.smtp_providers(id) ON DELETE SET NULL,
    provider_name TEXT,                  -- Denormalized for log permanence after provider deletion

    -- Message
    template_slug TEXT,                  -- e.g. 'signup_welcome', 'password_reset', or NULL for raw
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,

    -- Status
    status TEXT NOT NULL DEFAULT 'sent'
        CHECK (status IN ('sent', 'failed', 'bounced', 'deferred', 'queued')),
    error_message TEXT DEFAULT NULL,
    message_id TEXT DEFAULT NULL,        -- Provider-assigned message ID

    -- Timing
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ DEFAULT NULL,

    -- Extra
    meta JSONB DEFAULT '{}'::jsonb       -- Provider response, headers, etc.
);

CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at
    ON public.email_delivery_logs (sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_logs_status
    ON public.email_delivery_logs (status);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient
    ON public.email_delivery_logs (recipient_email);

-- 3. EMAIL GLOBAL SETTINGS TABLE (single-row)
CREATE TABLE IF NOT EXISTS public.email_global_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    service_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    use_fallback_chain BOOLEAN NOT NULL DEFAULT TRUE,
    default_from_name TEXT NOT NULL DEFAULT 'CreatorPulse',
    default_from_email TEXT NOT NULL DEFAULT 'noreply@creatorpulse.com',
    default_reply_to TEXT DEFAULT NULL,
    global_signature_html TEXT DEFAULT '',
    bounce_handling_email TEXT DEFAULT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default row
INSERT INTO public.email_global_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- RLS Policies (admin-only)
ALTER TABLE public.smtp_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_global_settings ENABLE ROW LEVEL SECURITY;

-- Allow service role (API routes) full access; admin users read via service key
CREATE POLICY "service_role_smtp_providers" ON public.smtp_providers
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_email_logs" ON public.email_delivery_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_email_global" ON public.email_global_settings
    FOR ALL TO service_role USING (true) WITH CHECK (true);
