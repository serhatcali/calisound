import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getTopPosts } from '@/lib/social-analytics-service'

export const dynamic = 'force-dynamic'

// GET: Get top performing posts
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const posts = await getTopPosts(limit)
    return NextResponse.json(posts)
  } catch (error: any) {
    console.error('[API] Error fetching top posts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch top posts' },
      { status: 500 }
    )
  }
}
