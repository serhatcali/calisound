import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { rejectSocialPost } from '@/lib/social-media-service'
import { getClientIP, rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

// POST: Reject a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await isAdminAuthenticated(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-reject:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 20,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const reason = body.reason || undefined

    // Get admin user ID (single admin user)
    const rejectedBy = 'admin'

    const post = await rejectSocialPost(params.id, rejectedBy, reason)
    return NextResponse.json(post)
  } catch (error: any) {
    console.error('[API] Error rejecting post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reject post' },
      { status: 500 }
    )
  }
}
