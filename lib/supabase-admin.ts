import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get environment variables with safe defaults for build time
// Use valid JWT format for placeholder key to prevent Supabase client errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Only log errors in development, not during build
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL && !process.env.NEXT_PHASE) {
    console.error('❌ Supabase admin credentials not found!')
    console.error('Please set SUPABASE_SERVICE_ROLE_KEY in .env.local for admin operations')
  }
} else {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL && !process.env.NEXT_PHASE) {
    console.log('✅ Supabase admin client initialized')
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('  Using service role key (bypasses RLS)')
    } else {
      console.log('  Using anon key (relies on RLS policies)')
    }
  }
}

// Admin client - uses service role key if available, otherwise anon key
// Use placeholder values during build to prevent errors
// These will be replaced with actual values at runtime
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
})
