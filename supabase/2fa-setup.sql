-- Create admin_settings table for 2FA
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default 2FA settings (will be updated when 2FA is enabled)
INSERT INTO admin_settings (key, value)
VALUES ('2fa_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

INSERT INTO admin_settings (key, value)
VALUES ('2fa_secret', '')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated can read settings" ON admin_settings;
DROP POLICY IF EXISTS "Authenticated can update settings" ON admin_settings;
DROP POLICY IF EXISTS "Authenticated can insert settings" ON admin_settings;
DROP POLICY IF EXISTS "Service role can access settings" ON admin_settings;

-- Allow all operations (RLS is enabled but policy allows all)
-- Security is handled at API route level with admin authentication
-- This allows server-side operations to work
CREATE POLICY "Allow all operations" ON admin_settings
FOR ALL
USING (true)
WITH CHECK (true);
