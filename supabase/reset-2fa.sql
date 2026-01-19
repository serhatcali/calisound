-- Emergency 2FA Reset
-- Run this in Supabase SQL Editor to completely reset 2FA
-- This will allow you to access the admin panel again

-- Disable 2FA
UPDATE admin_settings 
SET value = 'false' 
WHERE key = '2fa_enabled';

-- If the above doesn't work, try upsert:
INSERT INTO admin_settings (key, value)
VALUES ('2fa_enabled', 'false')
ON CONFLICT (key) DO UPDATE SET value = 'false';

-- Delete 2FA secret
DELETE FROM admin_settings 
WHERE key = '2fa_secret';

-- Verify the reset
SELECT key, value 
FROM admin_settings 
WHERE key IN ('2fa_enabled', '2fa_secret');

-- Expected result:
-- 2fa_enabled should be 'false'
-- 2fa_secret should not exist (no rows returned)
