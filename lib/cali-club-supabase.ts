// Supabase client for CALI Club (client-side)
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Check if we're in build phase
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                     process.env.NEXT_PHASE === 'phase-export' ||
                     !process.env.VERCEL_ENV

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// During build phase: return mock client if env vars are missing
let caliClubSupabase: SupabaseClient

if (isBuildPhase && (!supabaseUrl || !supabaseAnonKey)) {
  const mockQueryBuilder = {
    eq: () => mockQueryBuilder,
    neq: () => mockQueryBuilder,
    not: () => mockQueryBuilder,
    order: () => mockQueryBuilder,
    limit: () => mockQueryBuilder,
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
    select: async () => ({ data: [], error: null }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
  }
  
  caliClubSupabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      if (prop === 'from') {
        return () => mockQueryBuilder
      }
      return async () => ({ data: null, error: null })
    }
  }) as SupabaseClient
} else {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not found for CALI Club')
  }

  caliClubSupabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key', {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
}

export const supabase = caliClubSupabase
