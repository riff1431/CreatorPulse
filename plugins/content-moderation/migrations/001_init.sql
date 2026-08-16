-- Content Moderation Initial Schema
CREATE TABLE IF NOT EXISTS cp_plugin_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
