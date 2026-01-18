-- Simple 2FA setup - Drop and recreate if exists
DROP TABLE IF EXISTS admin_settings CASCADE;

-- Create admin_settings table for 2FA
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default 2FA settings
INSERT INTO admin_settings (key, value) VALUES
  ('2fa_enabled', 'false'),
  ('2fa_secret', '');

-- Disable RLS for this table (security handled at API level)
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);
