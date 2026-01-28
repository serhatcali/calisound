import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { 
  getTagPacks, 
  createTagPack 
} from '@/lib/social-media-service'
import { getClientIP, rateLimit, validateString } from '@/lib/security'

export const dynamic = 'force-dynamic'

// GET: List tag packs
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const packs = await getTagPacks()
    return NextResponse.json(packs)
  } catch (error: any) {
    console.error('[API] Error fetching tag packs:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tag packs' },
      { status: 500 }
    )
  }
}

// POST: Create tag pack
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-tagpack:${clientIP}`, {
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

    if (!body.tags || typeof body.tags !== 'string') {
      return NextResponse.json(
        { error: 'Tags (comma-separated string) is required' },
        { status: 400 }
      )
    }

    const pack = await createTagPack({
      name: nameValidation.value!,
      tags: body.tags,
      description: body.description || undefined,
    })

    return NextResponse.json(pack, { status: 201 })
  } catch (error: any) {
    console.error('[API] Error creating tag pack:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create tag pack' },
      { status: 500 }
    )
  }
}
