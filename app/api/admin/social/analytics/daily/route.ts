import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getDailyMetrics } from '@/lib/social-analytics-service'

export const dynamic = 'force-dynamic'

// GET: Get daily metrics
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const metrics = await getDailyMetrics(days)
    return NextResponse.json(metrics)
  } catch (error: any) {
    console.error('[API] Error fetching daily metrics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch daily metrics' },
      { status: 500 }
    )
  }
}
