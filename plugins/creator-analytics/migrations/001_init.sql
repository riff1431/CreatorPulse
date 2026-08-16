-- Migration 001 for plugin-creator-analytics
-- Schema for Creator Analytics & Insights Add-on Plugin

CREATE TABLE IF NOT EXISTS plugin_creator_analytics_events (
  id VARCHAR(64) PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL, -- profile_view, post_view, reel_view, story_view, post_like, post_comment, post_share, revenue_earn, follower_gain, follower_loss
  creator_id VARCHAR(64) NOT NULL,
  viewer_id VARCHAR(64),
  content_id VARCHAR(64),
  content_type VARCHAR(32), -- post, reel, story, subscription, tip
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_creator ON plugin_creator_analytics_events(creator_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON plugin_creator_analytics_events(event_type);

CREATE TABLE IF NOT EXISTS plugin_creator_analytics_daily_stats (
  id VARCHAR(64) PRIMARY KEY,
  creator_id VARCHAR(64) NOT NULL,
  date DATE NOT NULL,
  profile_views INT DEFAULT 0,
  net_followers INT DEFAULT 0,
  net_subscribers INT DEFAULT 0,
  post_impressions INT DEFAULT 0,
  reel_views INT DEFAULT 0,
  story_views INT DEFAULT 0,
  total_likes INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  total_shares INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(creator_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_creator_date ON plugin_creator_analytics_daily_stats(creator_id, date);

CREATE TABLE IF NOT EXISTS plugin_creator_analytics_content_metrics (
  id VARCHAR(64) PRIMARY KEY,
  content_id VARCHAR(64) UNIQUE NOT NULL,
  creator_id VARCHAR(64) NOT NULL,
  content_type VARCHAR(32) NOT NULL, -- Post, Reel, Story
  title VARCHAR(255) NOT NULL,
  thumbnail_url TEXT,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  watch_time_seconds INT DEFAULT 0,
  completion_rate_percent DECIMAL(5,2) DEFAULT 0.00,
  revenue DECIMAL(12,2) DEFAULT 0.00,
  engagement_rate DECIMAL(5,2) DEFAULT 0.00,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_metrics_creator ON plugin_creator_analytics_content_metrics(creator_id);
