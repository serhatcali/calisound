import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getTopCities } from '@/lib/social-analytics-service'

export const dynamic = 'force-dynamic'

// GET: Get top cities
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const cities = await getTopCities(limit)
    return NextResponse.json(cities)
  } catch (error: any) {
    console.error('[API] Error fetching top cities:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch top cities' },
      { status: 500 }
    )
  }
}
