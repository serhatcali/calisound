import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getSocialTemplates } from '@/lib/social-media-service'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getClientIP, rateLimit, validateString } from '@/lib/security'

export const dynamic = 'force-dynamic'

// GET: Get all templates
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') || undefined

    const templates = await getSocialTemplates(platform as any)
    return NextResponse.json(templates)
  } catch (error: any) {
    console.error('[API] Error fetching templates:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST: Create template
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-template-create:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 20,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.platform || !body.name || !body.text_template) {
      return NextResponse.json(
        { error: 'platform, name, and text_template are required' },
        { status: 400 }
      )
    }

    // Validate platform
    const validPlatforms = ['youtube', 'youtube_shorts', 'instagram', 'instagram_story', 'tiktok', 'twitter', 'facebook']
    if (!validPlatforms.includes(body.platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      )
    }

    // Validate name length
    const nameValidation = validateString(body.name, {
      minLength: 1,
      maxLength: 100,
    })
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: 'Name must be 1-100 characters' },
        { status: 400 }
      )
    }

    const { data: template, error } = await supabaseAdmin
      .from('social_templates')
      .insert({
        platform: body.platform,
        name: body.name,
        text_template: body.text_template,
        hashtag_template: body.hashtag_template || null,
        tag_template: body.tag_template || null,
        rules: body.rules || {},
        created_by: 'admin',
      })
      .select()
      .single()

    if (error) throw error

    // Log audit
    await supabaseAdmin
      .from('social_audit_log')
      .insert({
        actor_id: 'admin',
        action: 'create',
        entity_type: 'template',
        entity_id: template.id,
        meta: { platform: body.platform, name: body.name },
      })

    return NextResponse.json(template)
  } catch (error: any) {
    console.error('[API] Error creating template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    )
  }
}
