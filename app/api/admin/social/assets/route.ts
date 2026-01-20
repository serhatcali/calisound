import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getSocialAssets } from '@/lib/social-media-service'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getClientIP, rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

// GET: Get all assets
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('city_id') || undefined
    const type = searchParams.get('type') || undefined
    const aspectRatio = searchParams.get('aspect_ratio') || undefined

    const assets = await getSocialAssets({
      city_id: cityId,
      type,
      aspect_ratio: aspectRatio,
    })

    return NextResponse.json(assets)
  } catch (error: any) {
    console.error('[API] Error fetching assets:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

// POST: Create asset (metadata only, file upload handled separately)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-asset-create:${clientIP}`, {
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
    if (!body.storage_path || !body.type) {
      return NextResponse.json(
        { error: 'storage_path and type are required' },
        { status: 400 }
      )
    }

    // Validate type
    if (!['image', 'video'].includes(body.type)) {
      return NextResponse.json(
        { error: 'type must be "image" or "video"' },
        { status: 400 }
      )
    }

    const { data: asset, error } = await supabaseAdmin
      .from('social_assets')
      .insert({
        storage_path: body.storage_path,
        type: body.type,
        width: body.width,
        height: body.height,
        aspect_ratio: body.aspect_ratio,
        dpi: body.dpi || 72,
        checksum: body.checksum,
        usage: body.usage,
        city_id: body.city_id || null,
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
        entity_type: 'asset',
        entity_id: asset.id,
        meta: { type: body.type, storage_path: body.storage_path },
      })

    return NextResponse.json(asset)
  } catch (error: any) {
    console.error('[API] Error creating asset:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create asset' },
      { status: 500 }
    )
  }
}
