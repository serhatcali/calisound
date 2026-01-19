import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
// Use service role key for admin operations (bypasses RLS)
// If service role key is not available, use anon key (RLS policies should allow access)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only log errors in development, not during build
if (!supabaseUrl || !supabaseServiceKey) {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    console.error('❌ Supabase admin credentials not found!')
    console.error('Please set SUPABASE_SERVICE_ROLE_KEY in .env.local for admin operations')
  }
} else {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    console.log('✅ Supabase admin client initialized')
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('  Using service role key (bypasses RLS)')
    } else {
      console.log('  Using anon key (relies on RLS policies)')
    }
  }
}

// Admin client - uses service role key if available, otherwise anon key
// Use empty strings as fallback to prevent build errors
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  {
    auth: {
      persistSession: false
    }
  }
)
