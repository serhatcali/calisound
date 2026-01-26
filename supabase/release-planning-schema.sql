-- Release Planning System Schema
-- AI-Assisted Release Planner (No Social APIs)
-- Run this in Supabase SQL Editor

-- Releases (Song Releases)
CREATE TABLE IF NOT EXISTS releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_title TEXT NOT NULL,
  city TEXT,
  country TEXT,
  local_language TEXT NOT NULL,
  local_language_code TEXT NOT NULL, -- ISO 639-1 code (en, tr, es, etc.)
  include_english BOOLEAN DEFAULT false,
  release_at TIMESTAMPTZ NOT NULL, -- Stored in UTC
  timezone TEXT NOT NULL DEFAULT 'Europe/Istanbul',
  fast_mode BOOLEAN DEFAULT false, -- True if release < 7 days away
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'planning', 'active', 'completed')),
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Release Assets (16:9, 9:16, 1:1, audio)
CREATE TABLE IF NOT EXISTS release_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('16_9', '9_16', '1_1', 'audio')),
  storage_path TEXT NOT NULL, -- Supabase Storage path
  url TEXT, -- Public URL
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platform Plans (Platform-specific copy for each release)
CREATE TABLE IF NOT EXISTS platform_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN (
    'youtube', 'youtube_shorts', 'instagram_reels', 'instagram_story',
    'tiktok', 'tiktok_story', 'twitter', 'soundcloud'
  )),
  planned_at TIMESTAMPTZ NOT NULL, -- When to post (UTC)
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'reminded', 'published', 'skipped')),
  reminder_offset_min INTEGER DEFAULT 120, -- Minutes before planned_at to send reminder
  title TEXT,
  description TEXT,
  hashtags TEXT[], -- Array of hashtags
  tags TEXT, -- YouTube tags (comma-separated, max 500 chars)
  asset_urls TEXT[], -- Array of asset URLs to use
  quick_upload_link TEXT, -- Platform-specific upload link
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(release_id, platform, planned_at)
);

-- Promotion Days (Timeline: T-7 to T+3 or T-3 to T+3)
CREATE TABLE IF NOT EXISTS promotion_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  day_offset INTEGER NOT NULL, -- -7 to +3 (normal) or -3 to +3 (fast)
  date DATE NOT NULL,
  focus TEXT, -- What to focus on this day
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(release_id, day_offset)
);

-- Daily Tasks (Tasks for each day)
CREATE TABLE IF NOT EXISTS daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  day_offset INTEGER NOT NULL,
  platform TEXT, -- NULL for general tasks
  title TEXT NOT NULL,
  details TEXT,
  priority INTEGER DEFAULT 2 CHECK (priority IN (1, 2, 3)), -- 1=high, 2=medium, 3=low
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Logs (Track sent emails)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  platform_plan_id UUID REFERENCES platform_plans(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('daily_task', 'reminder')),
  recipient TEXT NOT NULL DEFAULT 'djcalitr@gmail.com',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Store date separately for unique constraint
  subject TEXT,
  content_preview TEXT
);

-- Unique constraint to prevent duplicate emails per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_logs_unique_daily 
ON email_logs(release_id, platform_plan_id, type, sent_date)
WHERE release_id IS NOT NULL OR platform_plan_id IS NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_releases_release_at ON releases(release_at);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_release_assets_release_id ON release_assets(release_id);
CREATE INDEX IF NOT EXISTS idx_platform_plans_release_id ON platform_plans(release_id);
CREATE INDEX IF NOT EXISTS idx_platform_plans_planned_at ON platform_plans(planned_at);
CREATE INDEX IF NOT EXISTS idx_platform_plans_status ON platform_plans(status);
CREATE INDEX IF NOT EXISTS idx_promotion_days_release_id ON promotion_days(release_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_release_id ON daily_tasks(release_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_day_offset ON daily_tasks(day_offset);
CREATE INDEX IF NOT EXISTS idx_email_logs_release_id ON email_logs(release_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

-- RLS Policies
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only access" ON releases FOR ALL USING (true);
CREATE POLICY "Admin only access" ON release_assets FOR ALL USING (true);
CREATE POLICY "Admin only access" ON platform_plans FOR ALL USING (true);
CREATE POLICY "Admin only access" ON promotion_days FOR ALL USING (true);
CREATE POLICY "Admin only access" ON daily_tasks FOR ALL USING (true);
CREATE POLICY "Admin only access" ON email_logs FOR ALL USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON releases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_plans_updated_at BEFORE UPDATE ON platform_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_tasks_updated_at BEFORE UPDATE ON daily_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
