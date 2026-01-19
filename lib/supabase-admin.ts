import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization - client is only created at runtime, not during build
let supabaseAdminInstance: SupabaseClient | null = null

function getSupabaseAdminClient(): SupabaseClient {
  // Check if we're in build phase (not runtime)
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.env.NEXT_PHASE === 'phase-export'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build phase: don't create client if env vars are missing
  // This prevents placeholder from being cached and used at runtime
  if (isBuildPhase) {
    if (!supabaseUrl || !supabaseServiceKey) {
      // Return a mock client that throws on use
      return new Proxy({} as SupabaseClient, {
        get() {
          throw new Error('Supabase admin client not available during build. Environment variables must be set.')
        }
      })
    }
  }

  // Runtime or build with env vars: require actual credentials
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) must be set in environment variables')
  }

  // Create or return cached instance
  if (!supabaseAdminInstance) {
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
  }

  return supabaseAdminInstance
}

// Export as getter - creates client lazily on first access
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdminClient()
    const value = client[prop as keyof SupabaseClient]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})
