-- 2FA Setup Script for CALI Sound Admin Panel
-- Run this in Supabase SQL Editor

-- Step 1: Drop table if exists (optional - only if you want to start fresh)
-- DROP TABLE IF EXISTS admin_settings CASCADE;

-- Step 2: Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Insert default values
INSERT INTO admin_settings (key, value) VALUES
  ('2fa_enabled', 'false'),
  ('2fa_secret', '')
ON CONFLICT (key) DO NOTHING;

-- Step 4: Disable RLS (security handled at API level)
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;

-- Step 5: Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);

-- Verify: Check if table was created
SELECT * FROM admin_settings;
