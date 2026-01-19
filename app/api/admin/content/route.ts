import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAdminAuthAndCSRF } from '@/lib/api-security'
import { validateString, validateObject } from '@/lib/security'
import { getClientIP, rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

// GET - Fetch all site content
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`admin-content-get:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 30,
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

    // Check authentication (GET requests don't need CSRF)
    const { isAdminAuthenticated } = await import('@/lib/admin-auth')
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('site_content')
      .select('id, key, section, label, content_en, content_local, content_type, description, updated_at')
      .order('section', { ascending: true })
      .order('label', { ascending: true })

    if (error) {
      console.error('Error fetching site content:', error)
      return NextResponse.json(
        { error: 'Failed to fetch site content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, content: data || [] })
  } catch (error: any) {
    console.error('Error in GET /api/admin/content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site content' },
      { status: 500 }
    )
  }
}

// PUT - Update site content
export async function PUT(request: NextRequest) {
  return withAdminAuthAndCSRF(async (req: NextRequest) => {
    try {
      const body = await req.json()

      // Validate input
      const validation = validateObject(body, {
        id: { required: true, type: 'string' },
        content_en: { required: true, type: 'string', maxLength: 10000 },
        content_local: { required: false, type: 'string', maxLength: 10000 },
      })

      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.errors?.[0] || 'Invalid input' },
          { status: 400 }
        )
      }

      const { id, content_en, content_local } = body

      // Validate ID format
      const idValidation = validateString(id, { minLength: 1, maxLength: 100 })
      if (!idValidation.valid) {
        return NextResponse.json(
          { error: 'Invalid content ID' },
          { status: 400 }
        )
      }

      // Update content
      const { data, error } = await supabaseAdmin
        .from('site_content')
        .update({
          content_en: content_en.trim(),
          content_local: content_local?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('id, key, section, label, content_en, content_local, content_type, description, updated_at')
        .single()

      if (error) {
        console.error('Error updating site content:', error)
        return NextResponse.json(
          { error: 'Failed to update site content' },
          { status: 500 }
        )
      }

      if (!data) {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, content: data })
    } catch (error: any) {
      console.error('Error in PUT /api/admin/content:', error)
      return NextResponse.json(
        { error: 'Failed to update site content' },
        { status: 500 }
      )
    }
  })(request)
}
