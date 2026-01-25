import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getSocialAnalyticsOverview } from '@/lib/social-analytics-service'

export const dynamic = 'force-dynamic'

// GET: Get analytics overview
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const overview = await getSocialAnalyticsOverview()
    return NextResponse.json(overview)
  } catch (error: any) {
    console.error('[API] Error fetching analytics overview:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics overview' },
      { status: 500 }
    )
  }
}
