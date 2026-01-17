/**
 * Fix RLS Policies - Run this if data exists but pages are empty
 * 
 * This script checks and fixes RLS policies
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 Checking RLS Policies...\n')

// Note: This requires service_role key for admin operations
// For now, just provide SQL to run in Supabase SQL Editor

const fixRLSSQL = `
-- Fix RLS Policies for CALI Sound
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for cities" ON cities;
DROP POLICY IF EXISTS "Public read access for sets" ON sets;
DROP POLICY IF EXISTS "Public read access for global_links" ON global_links;
DROP POLICY IF EXISTS "Public insert for click_tracking" ON click_tracking;

-- Recreate policies
CREATE POLICY "Public read access for cities" ON cities
  FOR SELECT USING (true);

CREATE POLICY "Public read access for sets" ON sets
  FOR SELECT USING (true);

CREATE POLICY "Public read access for global_links" ON global_links
  FOR SELECT USING (true);

CREATE POLICY "Public insert for click_tracking" ON click_tracking
  FOR INSERT WITH CHECK (true);
`

console.log('📝 Copy and run this SQL in Supabase SQL Editor:\n')
console.log(fixRLSSQL)
console.log('\n✅ After running, refresh your browser!')
