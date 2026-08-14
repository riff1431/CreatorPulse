-- Migration 001: Initialize database schema for plugin-starter-plugin
-- Creates tables for storing analytics data and custom key-value settings.

CREATE TABLE IF NOT EXISTS cp_plugin_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id VARCHAR(255) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS cp_plugin_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cp_plugin_analytics_plugin_id ON cp_plugin_analytics(plugin_id);
