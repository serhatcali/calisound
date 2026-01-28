-- Release Templates Schema
-- Allows saving and reusing release configurations

-- Release Templates Table
CREATE TABLE IF NOT EXISTS release_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Template configuration (matches Release fields)
  default_city TEXT,
  default_country TEXT,
  default_local_language TEXT DEFAULT 'English',
  default_local_language_code TEXT DEFAULT 'en',
  default_include_english BOOLEAN DEFAULT true,
  default_timezone TEXT DEFAULT 'Europe/Istanbul',
  default_fast_mode BOOLEAN DEFAULT false,
  
  -- Platform selection
  default_platforms TEXT[] DEFAULT ARRAY['youtube', 'instagram_reels', 'tiktok', 'twitter']::TEXT[],
  
  -- Template metadata
  tags TEXT[], -- For categorization (e.g., ['afrohouse', 'festival', 'summer'])
  is_public BOOLEAN DEFAULT false, -- Public templates available to all users
  usage_count INTEGER DEFAULT 0, -- Track how many times template was used
  last_used_at TIMESTAMPTZ,
  
  -- Ownership
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_release_templates_created_by ON release_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_release_templates_tags ON release_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_release_templates_is_public ON release_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_release_templates_usage_count ON release_templates(usage_count DESC);

-- RLS Policies
ALTER TABLE release_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin only access" ON release_templates;

-- Admin can do everything
CREATE POLICY "Admin only access" ON release_templates FOR ALL USING (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_release_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_release_templates_updated_at ON release_templates;
CREATE TRIGGER update_release_templates_updated_at 
  BEFORE UPDATE ON release_templates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_release_templates_updated_at();

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE release_templates
  SET 
    usage_count = usage_count + 1,
    last_used_at = NOW()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;
