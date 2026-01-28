import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { 
  updateHashtagSet, 
  deleteHashtagSet 
} from '@/lib/social-media-service'
import { getClientIP, rateLimit, validateString } from '@/lib/security'

export const dynamic = 'force-dynamic'

// PUT: Update hashtag set
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-hashtag-update:${clientIP}`, {
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

    const set = await updateHashtagSet(params.id, body)
    return NextResponse.json(set)
  } catch (error: any) {
    console.error('[API] Error updating hashtag set:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update hashtag set' },
      { status: 500 }
    )
  }
}

// DELETE: Delete hashtag set
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteHashtagSet(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] Error deleting hashtag set:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete hashtag set' },
      { status: 500 }
    )
  }
}
