import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getClientIP, rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

// GET - Fetch site content (public API)
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`site-content-get:${clientIP}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 60, // 60 requests per minute
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
          },
        }
      )
    }

    // Get locale from query parameter (default: 'en')
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const keys = searchParams.get('keys')?.split(',') || []

    // Fetch content
    let query = supabase
      .from('site_content')
      .select('key, content_en, content_local')

    // Filter by keys if provided
    if (keys.length > 0) {
      query = query.in('key', keys)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching site content:', error)
      return NextResponse.json(
        { error: 'Failed to fetch site content' },
        { status: 500 }
      )
    }

    // Format response: key -> content mapping
    const content: Record<string, string> = {}
    data?.forEach(item => {
      content[item.key] = locale !== 'en' && item.content_local
        ? item.content_local
        : item.content_en
    })

    return NextResponse.json({
      success: true,
      content,
      locale,
    })
  } catch (error: any) {
    console.error('Error in GET /api/site-content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site content' },
      { status: 500 }
    )
  }
}
