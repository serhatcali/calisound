import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getPlatformPerformance } from '@/lib/social-analytics-service'

export const dynamic = 'force-dynamic'

// GET: Get platform performance
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const performance = await getPlatformPerformance(days)
    return NextResponse.json(performance)
  } catch (error: any) {
    console.error('[API] Error fetching platform performance:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch platform performance' },
      { status: 500 }
    )
  }
}
