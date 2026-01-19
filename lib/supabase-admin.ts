import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization - client is only created at runtime, not during build
let supabaseAdminInstance: SupabaseClient | null = null

function getSupabaseAdminClient(): SupabaseClient {
  // Check if we're in build phase (not runtime)
  // Runtime'da VERCEL_ENV set edilir, build sırasında set edilmez
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.env.NEXT_PHASE === 'phase-export' ||
                       process.env.NEXT_PHASE === 'phase-development-build' ||
                       // Vercel build sırasında VERCEL_ENV set edilmez
                       (process.env.VERCEL === '1' && !process.env.VERCEL_ENV) ||
                       // CI/CD ortamlarında da build phase olabilir
                       (process.env.CI === 'true' && !process.env.VERCEL_ENV)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build phase: ALWAYS use mock client to prevent network calls
  // This prevents placeholder.supabase.co errors during build
  // At runtime, we ALWAYS require real credentials
  if (isBuildPhase) {
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
