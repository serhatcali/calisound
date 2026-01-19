import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test Supabase connection - same query as getAllCities()
    const { data, error, count } = await supabase
      .from('cities')
      .select('*', { count: 'exact' })
      .not('youtube_full', 'is', null)
      .order('release_datetime', { ascending: false, nullsFirst: false })
      .limit(5)

    return NextResponse.json({
      success: true,
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
        nextPhase: process.env.NEXT_PHASE,
        vercelEnv: process.env.VERCEL_ENV,
        nodeEnv: process.env.NODE_ENV,
      },
      supabase: {
        dataCount: data?.length || 0,
        totalCount: count || 0,
        error: error ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        } : null,
        sampleData: data?.slice(0, 2) || [],
      },
    })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: {
        message: err.message,
        stack: err.stack,
      },
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nextPhase: process.env.NEXT_PHASE,
        vercelEnv: process.env.VERCEL_ENV,
        nodeEnv: process.env.NODE_ENV,
      },
    }, { status: 500 })
  }
}
