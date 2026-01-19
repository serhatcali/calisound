import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization - client is only created at runtime, not during build
let supabaseAdminInstance: SupabaseClient | null = null

function getSupabaseAdminClient(): SupabaseClient {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    // Use placeholder values only during build
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      supabaseAdminInstance = createClient(
        'https://placeholder.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
        { auth: { persistSession: false } }
      )
      return supabaseAdminInstance
    }

    // Runtime error - credentials are required
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) must be set')
  }

  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false
    }
  })

  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL && !process.env.NEXT_PHASE) {
    console.log('✅ Supabase admin client initialized')
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('  Using service role key (bypasses RLS)')
    } else {
      console.log('  Using anon key (relies on RLS policies)')
    }
  }

  return supabaseAdminInstance
}

// Export as getter function - only creates client when accessed at runtime
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseAdminClient()[prop as keyof SupabaseClient]
  }
})
