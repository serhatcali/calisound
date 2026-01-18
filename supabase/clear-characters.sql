-- Clear all CALI Club characters
-- Run this in Supabase SQL Editor

-- Option 1: Set all characters to inactive (they will disappear from scene)
UPDATE cali_club_characters
SET is_active = false
WHERE is_active = true;

-- Option 2: Delete all characters completely (uncomment to use)
-- DELETE FROM cali_club_characters;

-- Check remaining characters
SELECT id, name, session_id, is_active, created_at
FROM cali_club_characters
ORDER BY created_at DESC;
