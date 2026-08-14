-- ============================================================================
-- CREATORPULSE: ADMIN MEDIA ASSETS MIGRATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    folder TEXT NOT NULL CHECK (folder IN ('avatars', 'covers', 'posts', 'reels', 'stories', 'messages', 'themes', 'plugins', 'documents')),
    driver TEXT NOT NULL CHECK (driver IN ('local', 'supabase')),
    path TEXT NOT NULL,
    url TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Linked entities metadata (for warnings and safeguards)
    is_linked BOOLEAN DEFAULT FALSE NOT NULL,
    linked_entity_type TEXT CHECK (linked_entity_type IN ('post', 'reel', 'profile_avatar', 'profile_cover', 'story', 'theme', 'plugin', 'message', 'document')),
    linked_entity_id TEXT,
    linked_entity_title TEXT
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- 1. Anyone logged in can read media assets
CREATE POLICY "Allow authenticated read access" ON public.media_assets
    FOR SELECT TO authenticated USING (true);

-- 2. Administrators can manage all media assets
CREATE POLICY "Allow admins full access" ON public.media_assets
    FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'manage_content'))
    WITH CHECK (public.has_permission(auth.uid(), 'manage_content'));

-- 3. Creators can insert and update their own uploaded media
CREATE POLICY "Allow creators to upload media" ON public.media_assets
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Allow creators to manage own media" ON public.media_assets
    FOR UPDATE TO authenticated
    USING (auth.uid() = uploaded_by)
    WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Allow creators to manage own delete" ON public.media_assets
    FOR DELETE TO authenticated
    USING (auth.uid() = uploaded_by);

-- Create index for performance
CREATE INDEX IF NOT EXISTS media_assets_folder_idx ON public.media_assets(folder);
CREATE INDEX IF NOT EXISTS media_assets_driver_idx ON public.media_assets(driver);
CREATE INDEX IF NOT EXISTS media_assets_uploaded_by_idx ON public.media_assets(uploaded_by);
