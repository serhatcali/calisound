import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { 
  getSocialPosts, 
  createSocialPost, 
  getSocialPost 
} from '@/lib/social-media-service'
import { getClientIP, rateLimit, validateString } from '@/lib/security'

export const dynamic = 'force-dynamic'

// GET: List posts or get single post
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const cityId = searchParams.get('city_id')
    const limit = searchParams.get('limit')

    if (id) {
      // Get single post
      const post = await getSocialPost(id)
      return NextResponse.json(post)
    }

    // List posts
    const posts = await getSocialPosts({
      status: status as any,
      city_id: cityId || undefined, // UUID, no need to parse
      limit: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json(posts)
  } catch (error: any) {
    console.error('[API] Error fetching posts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST: Create new post
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-create:${clientIP}`, {
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
    const titleValidation = validateString(body.title, {
      required: true,
      minLength: 1,
      maxLength: 200,
    })

    if (!titleValidation.valid) {
      return NextResponse.json(
        { error: 'Title is required and must be 1-200 characters' },
        { status: 400 }
      )
    }

    const baseTextValidation = validateString(body.base_text, {
      required: true,
      minLength: 1,
      maxLength: 5000,
    })

    if (!baseTextValidation.valid) {
      return NextResponse.json(
        { error: 'Base text is required and must be 1-5000 characters' },
        { status: 400 }
      )
    }

    // Create post
    const post = await createSocialPost({
      title: titleValidation.value!,
      base_text: baseTextValidation.value!,
      city_id: body.city_id || undefined, // UUID, no need to parse
      campaign_id: body.campaign_id || undefined,
      scheduled_at: body.scheduled_at || undefined,
      timezone: body.timezone || 'Europe/Istanbul',
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error: any) {
    console.error('[API] Error creating post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    )
  }
}
