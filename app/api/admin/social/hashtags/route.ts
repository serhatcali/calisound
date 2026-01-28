import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { 
  getHashtagSets, 
  createHashtagSet 
} from '@/lib/social-media-service'
import { getClientIP, rateLimit, validateString } from '@/lib/security'

export const dynamic = 'force-dynamic'

// GET: List hashtag sets
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    const sets = await getHashtagSets(platform as any)
    return NextResponse.json(sets)
  } catch (error: any) {
    console.error('[API] Error fetching hashtag sets:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hashtag sets' },
      { status: 500 }
    )
  }
}

// POST: Create hashtag set
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-hashtag:${clientIP}`, {
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

    const nameValidation = validateString(body.name, {
      required: true,
      minLength: 1,
      maxLength: 100,
    })

    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: 'Name is required and must be 1-100 characters' },
        { status: 400 }
      )
    }

    if (!body.platform || !Array.isArray(body.hashtags)) {
      return NextResponse.json(
        { error: 'Platform and hashtags array are required' },
        { status: 400 }
      )
    }

    const set = await createHashtagSet({
      name: nameValidation.value!,
      platform: body.platform,
      hashtags: body.hashtags,
      description: body.description || undefined,
    })

    return NextResponse.json(set, { status: 201 })
  } catch (error: any) {
    console.error('[API] Error creating hashtag set:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create hashtag set' },
      { status: 500 }
    )
  }
}
