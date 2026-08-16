-- Migration 001: Creator Verification Manager Plugin
-- Creates tables for verification applications, status history, and internal notes.

CREATE TABLE IF NOT EXISTS cp_verification_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','under_review','approved','rejected','changes_requested','expired','revoked')),
  full_legal_name TEXT NOT NULL,
  date_of_birth DATE,
  country TEXT,
  government_id_url TEXT,
  selfie_url TEXT,
  proof_of_address_url TEXT,
  social_media_links JSONB DEFAULT '[]'::jsonb,
  additional_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cp_verification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID,
  actor_role TEXT,
  previous_status TEXT,
  new_status TEXT,
  note TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cp_verification_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cv_apps_user ON cp_verification_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_apps_status ON cp_verification_applications(status);
CREATE INDEX IF NOT EXISTS idx_cv_history_app ON cp_verification_history(application_id);
CREATE INDEX IF NOT EXISTS idx_cv_notes_app ON cp_verification_notes(application_id);
