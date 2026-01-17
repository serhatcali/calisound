-- Clean up all sets from the sets table
-- Run this in Supabase SQL Editor

DELETE FROM sets;

-- Verify deletion
SELECT COUNT(*) as remaining_sets FROM sets;
