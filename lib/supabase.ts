import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization - client is only created at runtime, not during build
let supabaseInstance: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Use placeholder values only during build
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      supabaseInstance = createClient(
        'https://placeholder.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
        { auth: { persistSession: false } }
      )
      return supabaseInstance
    }

    // Runtime error - credentials are required
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set')
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

// Export as getter function - only creates client when accessed at runtime
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient]
  }
})
