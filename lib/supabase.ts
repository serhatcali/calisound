import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization - client is only created at runtime, not during build
let supabaseInstance: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  // Check if we're in build phase (not runtime)
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.env.NEXT_PHASE === 'phase-export' ||
                       process.env.NEXT_PHASE === 'phase-production-build' ||
                       !process.env.VERCEL_ENV // During build, VERCEL_ENV is not set

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build phase: don't create client if env vars are missing
  // This prevents placeholder from being cached and used at runtime
  if (isBuildPhase && (!supabaseUrl || !supabaseAnonKey)) {
    // Return a mock client that returns empty results instead of throwing
    return new Proxy({} as SupabaseClient, {
      get(_target, prop) {
        if (prop === 'from') {
          return () => ({
            select: () => ({
              eq: () => ({ data: [], error: null }),
              neq: () => ({ data: [], error: null }),
              not: () => ({ data: [], error: null }),
              order: () => ({ data: [], error: null }),
              limit: () => ({ data: [], error: null }),
              maybeSingle: () => ({ data: null, error: null }),
              single: () => ({ data: null, error: null }),
            }),
            insert: () => ({ data: null, error: null }),
            update: () => ({ data: null, error: null }),
            delete: () => ({ data: null, error: null }),
          })
        }
        return () => ({ data: null, error: null })
      }
    })
  }

  // Runtime or build with env vars: require actual credentials
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in environment variables')
  }

  // Create or return cached instance
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false
      }
    })

    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL && !process.env.NEXT_PHASE) {
      console.log('✅ Supabase client initialized')
      console.log('  URL:', supabaseUrl)
      console.log('  Key:', `${supabaseAnonKey.substring(0, 20)}...`)
    }
  }

  return supabaseInstance
}

// Export as getter - creates client lazily on first access
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    const value = client[prop as keyof SupabaseClient]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})
