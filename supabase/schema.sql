-- CALI Sound Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cities Table
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  country TEXT NOT NULL,
  country_flag TEXT NOT NULL,
  region TEXT NOT NULL CHECK (region IN ('Europe', 'MENA', 'Asia', 'Americas')),
  mood TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('SOON', 'OUT_NOW')),
  release_datetime TIMESTAMPTZ,
  cover_square_url TEXT,
  banner_16x9_url TEXT,
  shorts_9x16_url TEXT,
  youtube_full TEXT,
  youtube_shorts TEXT,
  instagram TEXT,
  tiktok TEXT,
  description_en TEXT,
  description_local TEXT,
  yt_title TEXT,
  yt_description TEXT,
  yt_tags TEXT CHECK (char_length(yt_tags) <= 500),
  hashtags TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sets Table
CREATE TABLE IF NOT EXISTS sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  youtube_embed TEXT NOT NULL,
  duration TEXT,
  chapters TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Global Links Table
CREATE TABLE IF NOT EXISTS global_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youtube TEXT,
  instagram TEXT,
  tiktok TEXT,
  spotify TEXT,
  apple_music TEXT,
  soundcloud TEXT,
  x TEXT,
  facebook TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Click Tracking Table
CREATE TABLE IF NOT EXISTS click_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_type TEXT NOT NULL,
  link_url TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_status ON cities(status);
CREATE INDEX IF NOT EXISTS idx_cities_region ON cities(region);
CREATE INDEX IF NOT EXISTS idx_cities_release_datetime ON cities(release_datetime);
CREATE INDEX IF NOT EXISTS idx_click_tracking_clicked_at ON click_tracking(clicked_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sets_updated_at BEFORE UPDATE ON sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_global_links_updated_at BEFORE UPDATE ON global_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Enable for public read access
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for cities" ON cities
  FOR SELECT USING (true);

CREATE POLICY "Public read access for sets" ON sets
  FOR SELECT USING (true);

CREATE POLICY "Public read access for global_links" ON global_links
  FOR SELECT USING (true);

-- Allow public insert for click tracking
CREATE POLICY "Public insert for click_tracking" ON click_tracking
  FOR INSERT WITH CHECK (true);

-- Note: For admin operations, you'll need to set up authentication
-- and create additional policies for authenticated users
