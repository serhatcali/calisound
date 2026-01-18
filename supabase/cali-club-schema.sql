-- CALI Club Database Schema
-- Run this in Supabase SQL Editor

-- 1. Şarkılar Tablosu (Apple Music)
CREATE TABLE IF NOT EXISTS cali_club_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  apple_music_id TEXT NOT NULL UNIQUE,
  apple_music_url TEXT,
  preview_url TEXT,
  artwork_url TEXT,
  duration INTEGER, -- Saniye cinsinden
  genre TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Karakterler Tablosu
CREATE TABLE IF NOT EXISTS cali_club_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL, -- Kullanıcı session ID
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
  avatar_data JSONB NOT NULL, -- {color, style, size, vb.}
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "z": 0}'::jsonb,
  rotation JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Chat Mesajları Tablosu
CREATE TABLE IF NOT EXISTS cali_club_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  character_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Konser Durumu Tablosu (Real-time için)
CREATE TABLE IF NOT EXISTS cali_club_state (
  id TEXT PRIMARY KEY DEFAULT 'main',
  current_song_id UUID REFERENCES cali_club_songs(id) ON DELETE SET NULL,
  is_playing BOOLEAN DEFAULT false,
  position FLOAT DEFAULT 0, -- Şarkı pozisyonu (saniye)
  volume FLOAT DEFAULT 1.0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Online Kullanıcılar (Session tracking)
CREATE TABLE IF NOT EXISTS cali_club_sessions (
  session_id TEXT PRIMARY KEY,
  character_id UUID REFERENCES cali_club_characters(id) ON DELETE CASCADE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cali_club_characters_session ON cali_club_characters(session_id);
CREATE INDEX IF NOT EXISTS idx_cali_club_characters_active ON cali_club_characters(is_active);
CREATE INDEX IF NOT EXISTS idx_cali_club_messages_created ON cali_club_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cali_club_songs_apple_id ON cali_club_songs(apple_music_id);

-- Initial state
INSERT INTO cali_club_state (id, current_song_id, is_playing, position, volume)
VALUES ('main', NULL, false, 0, 1.0)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE cali_club_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cali_club_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE cali_club_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cali_club_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE cali_club_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read, authenticated write
CREATE POLICY "Public read songs" ON cali_club_songs FOR SELECT USING (true);
CREATE POLICY "Public read characters" ON cali_club_characters FOR SELECT USING (true);
CREATE POLICY "Public read messages" ON cali_club_messages FOR SELECT USING (true);
CREATE POLICY "Public read state" ON cali_club_state FOR SELECT USING (true);

CREATE POLICY "Public insert characters" ON cali_club_characters FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update own character" ON cali_club_characters FOR UPDATE USING (true);
CREATE POLICY "Public delete own character" ON cali_club_characters FOR DELETE USING (true);

CREATE POLICY "Public insert messages" ON cali_club_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update state" ON cali_club_state FOR UPDATE USING (true);

CREATE POLICY "Public insert sessions" ON cali_club_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update own session" ON cali_club_sessions FOR UPDATE USING (true);
CREATE POLICY "Public delete own session" ON cali_club_sessions FOR DELETE USING (true);

-- Functions for cleanup (inactive characters)
CREATE OR REPLACE FUNCTION cleanup_inactive_characters()
RETURNS void AS $$
BEGIN
  DELETE FROM cali_club_characters
  WHERE is_active = false
    AND updated_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;
