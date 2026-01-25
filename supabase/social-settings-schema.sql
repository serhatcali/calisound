-- Social Media Settings Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS social_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::JSONB,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general', -- 'general', 'posting', 'approval', 'notifications'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE social_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read/write settings
CREATE POLICY "Admins can manage social settings"
ON social_settings
FOR ALL
USING (true) -- In production, check admin role
WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_settings_key ON social_settings(key);
CREATE INDEX IF NOT EXISTS idx_social_settings_category ON social_settings(category);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_social_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_social_settings_updated_at
  BEFORE UPDATE ON social_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_social_settings_updated_at();

-- Insert default settings
INSERT INTO social_settings (key, value, description, category) VALUES
  ('timezone', '"Europe/Istanbul"', 'Default timezone for scheduling posts', 'general'),
  ('require_approval', 'false', 'Require approval before publishing posts', 'approval'),
  ('auto_publish', 'false', 'Automatically publish posts when scheduled (requires OAuth)', 'posting'),
  ('default_hashtags', '[]', 'Default hashtags to add to posts', 'posting'),
  ('default_tags', '""', 'Default tags for YouTube posts', 'posting'),
  ('max_daily_posts', '10', 'Maximum number of posts per day per platform', 'posting'),
  ('notification_email', '""', 'Email address for publishing notifications', 'notifications'),
  ('enable_notifications', 'true', 'Enable email notifications for publishing events', 'notifications')
ON CONFLICT (key) DO NOTHING;
