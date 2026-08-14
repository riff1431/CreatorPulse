-- Migration to add media_url to public.announcements table
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS media_url TEXT DEFAULT '';
