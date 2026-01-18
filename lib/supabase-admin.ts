import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
// Use service role key for admin operations (bypasses RLS)
// If service role key is not available, use anon key (RLS policies should allow access)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase admin credentials not found!')
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY in .env.local for admin operations')
} else {
  console.log('✅ Supabase admin client initialized')
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('  Using service role key (bypasses RLS)')
  } else {
    console.log('  Using anon key (relies on RLS policies)')
  }
}

// Admin client - uses service role key if available, otherwise anon key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
})
