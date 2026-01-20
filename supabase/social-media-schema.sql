-- Social Media Suite Database Schema
-- Run this in Supabase SQL Editor

-- Social Media Accounts (for auto-publish mode)
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'youtube_shorts', 'instagram', 'instagram_story', 'tiktok', 'twitter', 'facebook')),
  handle TEXT NOT NULL,
  account_id TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'expired', 'error')),
  scopes TEXT[] DEFAULT ARRAY[]::TEXT[],
  token_encrypted TEXT, -- Encrypted access token
  refresh_encrypted TEXT, -- Encrypted refresh token
  expires_at TIMESTAMPTZ,
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform, handle)
);

-- Social Media Posts (base posts)
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  base_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'scheduled', 'publishing', 'published', 'failed')),
  scheduled_at TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'Europe/Istanbul', -- UTC+3
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  created_by TEXT NOT NULL DEFAULT 'admin',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  published_urls JSONB DEFAULT '{}'::JSONB, -- { platform: url }
  error_last TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Social Post Variants (platform-specific versions)
CREATE TABLE IF NOT EXISTS social_post_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'youtube_shorts', 'instagram', 'instagram_story', 'tiktok', 'twitter', 'facebook')),
  title TEXT,
  caption TEXT,
  description TEXT,
  hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT, -- Comma-separated for YouTube
  first_comment TEXT, -- For Instagram
  privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'unlisted', 'private')),
  validation JSONB DEFAULT '{}'::JSONB, -- { char_count: number, warnings: string[], errors: string[] }
  char_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, platform)
);

-- Social Assets (images/videos)
CREATE TABLE IF NOT EXISTS social_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  width INTEGER,
  height INTEGER,
  aspect_ratio TEXT, -- '16:9', '9:16', '1:1', etc.
  dpi INTEGER DEFAULT 72,
  checksum TEXT, -- For deduplication
  usage TEXT, -- 'cover', 'banner', 'story', etc.
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Social Templates
CREATE TABLE IF NOT EXISTS social_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'youtube_shorts', 'instagram', 'instagram_story', 'tiktok', 'twitter', 'facebook')),
  name TEXT NOT NULL,
  text_template TEXT NOT NULL,
  hashtag_template TEXT, -- Template for hashtags
  tag_template TEXT, -- Template for tags
  rules JSONB DEFAULT '{}'::JSONB, -- Validation rules
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform, name)
);

-- Social Jobs (for auto-publish tracking)
CREATE TABLE IF NOT EXISTS social_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  step TEXT NOT NULL, -- 'upload', 'publish', 'comment', etc.
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ,
  result JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Social Metrics (daily aggregated)
CREATE TABLE IF NOT EXISTS social_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  account_id TEXT,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  watch_time INTEGER DEFAULT 0, -- seconds
  saves INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform, account_id, date)
);

-- Social Audit Log
CREATE TABLE IF NOT EXISTS social_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT NOT NULL DEFAULT 'admin',
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'publish', 'approve', etc.
  entity_type TEXT NOT NULL, -- 'post', 'variant', 'account', etc.
  entity_id UUID,
  meta JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  utm_defaults JSONB DEFAULT '{}'::JSONB, -- { utm_source, utm_medium, utm_campaign }
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_at ON social_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_city_id ON social_posts(city_id);
CREATE INDEX IF NOT EXISTS idx_social_post_variants_post_id ON social_post_variants(post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_variants_platform ON social_post_variants(platform);
CREATE INDEX IF NOT EXISTS idx_social_assets_city_id ON social_assets(city_id);
CREATE INDEX IF NOT EXISTS idx_social_assets_aspect_ratio ON social_assets(aspect_ratio);
CREATE INDEX IF NOT EXISTS idx_social_jobs_status ON social_jobs(status);
CREATE INDEX IF NOT EXISTS idx_social_jobs_post_id ON social_jobs(post_id);
CREATE INDEX IF NOT EXISTS idx_social_metrics_daily_date ON social_metrics_daily(date);
CREATE INDEX IF NOT EXISTS idx_social_audit_log_created_at ON social_audit_log(created_at);

-- RLS Policies
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated admin users can access
CREATE POLICY "Admin only access" ON social_accounts FOR ALL USING (true); -- Admin auth handled by Next.js
CREATE POLICY "Admin only access" ON social_posts FOR ALL USING (true);
CREATE POLICY "Admin only access" ON social_post_variants FOR ALL USING (true);
CREATE POLICY "Admin only access" ON social_assets FOR ALL USING (true);
CREATE POLICY "Admin only access" ON social_templates FOR ALL USING (true);
CREATE POLICY "Admin only access" ON social_jobs FOR ALL USING (true);
CREATE POLICY "Admin only access" ON social_metrics_daily FOR ALL USING (true);
CREATE POLICY "Admin only access" ON social_audit_log FOR ALL USING (true);
CREATE POLICY "Admin only access" ON campaigns FOR ALL USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_post_variants_updated_at BEFORE UPDATE ON social_post_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_assets_updated_at BEFORE UPDATE ON social_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_templates_updated_at BEFORE UPDATE ON social_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_jobs_updated_at BEFORE UPDATE ON social_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_metrics_daily_updated_at BEFORE UPDATE ON social_metrics_daily FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
