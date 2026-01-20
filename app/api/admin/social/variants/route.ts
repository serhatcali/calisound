import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { 
  createPostVariant, 
  updatePostVariant 
} from '@/lib/social-media-service'
import { getClientIP, rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

// POST: Create variant
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-variant:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 50,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()

    if (!body.post_id || !body.platform) {
      return NextResponse.json(
        { error: 'post_id and platform are required' },
        { status: 400 }
      )
    }

    const variant = await createPostVariant({
      post_id: body.post_id,
      platform: body.platform,
      title: body.title,
      caption: body.caption,
      description: body.description,
      hashtags: body.hashtags || [],
      tags: body.tags,
      first_comment: body.first_comment,
      privacy: body.privacy || 'public',
    })

    return NextResponse.json(variant, { status: 201 })
  } catch (error: any) {
    console.error('[API] Error creating variant:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create variant' },
      { status: 500 }
    )
  }
}

// PUT: Update variant
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-variant:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 50,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { error: 'variant id is required' },
        { status: 400 }
      )
    }

    const variant = await updatePostVariant(body.id, body)
    return NextResponse.json(variant)
  } catch (error: any) {
    console.error('[API] Error updating variant:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update variant' },
      { status: 500 }
    )
  }
}
