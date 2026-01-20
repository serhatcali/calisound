import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { 
  getSocialPost, 
  updateSocialPost, 
  deleteSocialPost 
} from '@/lib/social-media-service'
import { getClientIP, rateLimit, validateString } from '@/lib/security'

export const dynamic = 'force-dynamic'

// GET: Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const post = await getSocialPost(params.id)
    return NextResponse.json(post)
  } catch (error: any) {
    console.error('[API] Error fetching post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

// PUT: Update post
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
    const rateLimitResult = rateLimit(`social-update:${clientIP}`, {
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

    // Validate if title/base_text are provided
    if (body.title !== undefined) {
      const titleValidation = validateString(body.title, {
        minLength: 1,
        maxLength: 200,
      })
      if (!titleValidation.valid) {
        return NextResponse.json(
          { error: 'Title must be 1-200 characters' },
          { status: 400 }
        )
      }
    }

    if (body.base_text !== undefined) {
      const baseTextValidation = validateString(body.base_text, {
        minLength: 1,
        maxLength: 5000,
      })
      if (!baseTextValidation.valid) {
        return NextResponse.json(
          { error: 'Base text must be 1-5000 characters' },
          { status: 400 }
        )
      }
    }

    // Update post
    const post = await updateSocialPost(params.id, body)
    return NextResponse.json(post)
  } catch (error: any) {
    console.error('[API] Error updating post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE: Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteSocialPost(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] Error deleting post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete post' },
      { status: 500 }
    )
  }
}
