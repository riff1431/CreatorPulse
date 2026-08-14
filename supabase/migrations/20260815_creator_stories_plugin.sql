-- ============================================================================
-- CREATORPULSE: CREATOR STORIES PLUGIN EXTENSION MIGRATION
-- ============================================================================

-- 1. Create Story Reactions Table
CREATE TABLE IF NOT EXISTS public.story_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create Story Replies Table
CREATE TABLE IF NOT EXISTS public.story_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE public.story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_replies ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for Reactions
-- Allow authenticated users to read reactions
CREATE POLICY "Allow authenticated read reactions" ON public.story_reactions
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to react to stories
CREATE POLICY "Allow authenticated insert reactions" ON public.story_reactions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow creators/admins to delete reactions on their own content
CREATE POLICY "Allow creators/admins to manage reactions" ON public.story_reactions
    FOR DELETE TO authenticated
    USING (
        auth.uid() = user_id OR 
        public.has_permission(auth.uid(), 'manage_content') OR
        EXISTS (
            SELECT 1 FROM public.stories s 
            WHERE s.id = story_id AND s.creator_id = auth.uid()
        )
    );

-- 5. Create RLS Policies for Replies
-- Allow authenticated users to read replies (creators read all; members read their own)
CREATE POLICY "Allow users to read replies" ON public.story_replies
    FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id OR
        public.has_permission(auth.uid(), 'manage_content') OR
        EXISTS (
            SELECT 1 FROM public.stories s 
            WHERE s.id = story_id AND s.creator_id = auth.uid()
        )
    );

-- Allow authenticated users to send replies
CREATE POLICY "Allow authenticated insert replies" ON public.story_replies
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow creators/admins to delete replies on their own content
CREATE POLICY "Allow creators/admins to manage replies" ON public.story_replies
    FOR DELETE TO authenticated
    USING (
        auth.uid() = user_id OR 
        public.has_permission(auth.uid(), 'manage_content') OR
        EXISTS (
            SELECT 1 FROM public.stories s 
            WHERE s.id = story_id AND s.creator_id = auth.uid()
        )
    );

-- 6. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS story_reactions_story_id_idx ON public.story_reactions(story_id);
CREATE INDEX IF NOT EXISTS story_reactions_user_id_idx ON public.story_reactions(user_id);
CREATE INDEX IF NOT EXISTS story_replies_story_id_idx ON public.story_replies(story_id);
CREATE INDEX IF NOT EXISTS story_replies_user_id_idx ON public.story_replies(user_id);
