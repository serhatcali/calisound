// Supabase client for CALI Club (client-side)
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Check if we're in build phase
// Vercel runtime'da VERCEL_ENV set edilir (production, preview, development)
// Build sırasında VERCEL_ENV set edilmez
// En güvenilir yöntem: VERCEL_ENV yoksa build phase'dir
const isRuntime = !!process.env.VERCEL_ENV
const isBuildPhase = !isRuntime

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// During build phase: ALWAYS use mock client to prevent network calls
// At runtime, we ALWAYS require real credentials
let caliClubSupabase: SupabaseClient

if (isBuildPhase) {
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
        const result = options?.count === 'exact' 
          ? { data: [], error: null, count: 0 }
          : { data: [], error: null }
        const selectPromise = Promise.resolve(result)
        Object.assign(selectPromise, builder)
        return selectPromise
      },
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
    }
    return builder
  }
  
  caliClubSupabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      if (prop === 'from') {
        return () => createMockQueryBuilder()
      }
      return async () => ({ data: null, error: null })
    }
  }) as SupabaseClient
} else {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Only warn during runtime, not during build
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.warn('⚠️ Supabase credentials not found for CALI Club')
    }
  }

  // Never use placeholder URL - throw error if credentials missing at runtime
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set for CALI Club')
  }

  caliClubSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
}

export const supabase = caliClubSupabase
