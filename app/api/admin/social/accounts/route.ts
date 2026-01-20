import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getSocialAccounts } from '@/lib/social-media-service'
import { getClientIP, rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

// GET: List all connected accounts
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accounts = await getSocialAccounts()
    return NextResponse.json(accounts)
  } catch (error: any) {
    console.error('[API] Error fetching accounts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

// POST: Connect a new account (OAuth initiation)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-connect:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 10,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()

    if (!body.platform || !body.handle) {
      return NextResponse.json(
        { error: 'platform and handle are required' },
        { status: 400 }
      )
    }

    // TODO: Implement OAuth flow
    // For now, return a placeholder response
    return NextResponse.json({
      message: 'OAuth flow will be implemented here',
      platform: body.platform,
      handle: body.handle,
      oauth_url: `https://example.com/oauth/${body.platform}`, // Placeholder
    })
  } catch (error: any) {
    console.error('[API] Error connecting account:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to connect account' },
      { status: 500 }
    )
  }
}
