import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { submitForReview } from '@/lib/social-media-service'
import { getClientIP, rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

// POST: Submit post for review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-submit:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 30,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const post = await submitForReview(params.id)
    return NextResponse.json(post)
  } catch (error: any) {
    console.error('[API] Error submitting post for review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit post for review' },
      { status: 500 }
    )
  }
}
