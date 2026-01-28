import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { approveSocialPost } from '@/lib/social-media-service'
import { getClientIP, rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

// POST: Approve a post
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
    const rateLimitResult = rateLimit(`social-approve:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 20,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Get admin user ID (single admin user)
    const approvedBy = 'admin'

    const post = await approveSocialPost(params.id, approvedBy)
    return NextResponse.json(post)
  } catch (error: any) {
    console.error('[API] Error approving post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve post' },
      { status: 500 }
    )
  }
}
