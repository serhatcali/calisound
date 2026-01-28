-- Hashtag Sets and Tag Packs Schema
-- Run this in Supabase SQL Editor

-- Hashtag Sets (reusable hashtag collections)
CREATE TABLE IF NOT EXISTS social_hashtag_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'youtube_shorts', 'instagram', 'instagram_story', 'tiktok', 'twitter', 'facebook')),
  hashtags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], -- Array of hashtags
  description TEXT,
  usage_count INTEGER DEFAULT 0, -- Track how many times it's been used
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name, platform)
);

-- Tag Packs (YouTube tags - comma-separated)
CREATE TABLE IF NOT EXISTS social_tag_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tags TEXT NOT NULL, -- Comma-separated tags for YouTube
  description TEXT,
  usage_count INTEGER DEFAULT 0, -- Track how many times it's been used
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_hashtag_sets_platform ON social_hashtag_sets(platform);
CREATE INDEX IF NOT EXISTS idx_social_hashtag_sets_name ON social_hashtag_sets(name);

-- RLS Policies
ALTER TABLE social_hashtag_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_tag_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only access" ON social_hashtag_sets FOR ALL USING (true);
CREATE POLICY "Admin only access" ON social_tag_packs FOR ALL USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_social_hashtag_sets_updated_at BEFORE UPDATE ON social_hashtag_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_tag_packs_updated_at BEFORE UPDATE ON social_tag_packs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
