import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getClientIP, rateLimit, validateString } from '@/lib/security'

export const dynamic = 'force-dynamic'

// PUT: Update template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-template-update:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 30,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validate name if provided
    if (body.name !== undefined) {
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
    }

    const { data: template, error } = await supabaseAdmin
      .from('social_templates')
      .update({
        name: body.name,
        text_template: body.text_template,
        hashtag_template: body.hashtag_template,
        tag_template: body.tag_template,
        rules: body.rules,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Log audit
    await supabaseAdmin
      .from('social_audit_log')
      .insert({
        actor_id: 'admin',
        action: 'update',
        entity_type: 'template',
        entity_id: params.id,
        meta: { name: template.name },
      })

    return NextResponse.json(template)
  } catch (error: any) {
    console.error('[API] Error updating template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE: Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-template-delete:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 20,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const { error } = await supabaseAdmin
      .from('social_templates')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    // Log audit
    await supabaseAdmin
      .from('social_audit_log')
      .insert({
        actor_id: 'admin',
        action: 'delete',
        entity_type: 'template',
        entity_id: params.id,
      })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] Error deleting template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    )
  }
}
