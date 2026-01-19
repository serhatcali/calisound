import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization - client is only created at runtime, not during build
let supabaseInstance: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if we're in build phase
  // Build phase: NEXT_PHASE is explicitly set
  // Runtime: Everything else (including when VERCEL_ENV is set or not set)
  const isBuildPhase = !!process.env.NEXT_PHASE

  // During build phase ONLY: use mock client if env vars are missing or invalid
  // This prevents placeholder.supabase.co errors during build
  // At runtime: ALWAYS use real client if env vars are valid
  if (isBuildPhase && (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder'))) {
    // Return a mock client that returns empty results - never calls createClient
    // This prevents any network calls to placeholder URLs
    const createMockQueryBuilder = () => {
      const builder: any = {
        eq: () => builder,
        neq: () => builder,
        not: () => builder,
        order: () => builder,
        limit: () => builder,
        maybeSingle: async () => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null }),
        select: (columns?: string, options?: any) => {
          // Return a promise that resolves to empty data
          const result = options?.count === 'exact' 
            ? { data: [], error: null, count: 0 }
            : { data: [], error: null }
          // Make select() chainable by returning builder, but also make it awaitable
          const selectPromise = Promise.resolve(result)
          // Add builder methods to promise for chaining
          Object.assign(selectPromise, builder)
          return selectPromise
        },
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
      }
      return builder
    }
    
    return new Proxy({} as SupabaseClient, {
      get(_target, prop) {
        if (prop === 'from') {
          return () => createMockQueryBuilder()
        }
        // Return async functions that return empty results
        return async () => ({ data: null, error: null })
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

    // Log in production runtime to debug
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.log('✅ Supabase client initialized (RUNTIME)')
      console.log('  URL:', supabaseUrl)
      console.log('  Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING')
      console.log('  isBuildPhase:', !!process.env.NEXT_PHASE)
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
