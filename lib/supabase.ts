import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization - client is only created at runtime, not during build
let supabaseInstance: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Check if we're in build phase
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.env.NEXT_PHASE === 'phase-export' ||
                       !process.env.NEXT_RUNTIME

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build phase or if credentials missing, use placeholder values
  if (isBuildPhase || !supabaseUrl || !supabaseAnonKey) {
    supabaseInstance = createClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
      { auth: { persistSession: false } }
    )
    return supabaseInstance
  }

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
