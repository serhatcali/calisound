import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get cities with release_datetime
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name, release_datetime, status')
      .not('release_datetime', 'is', null)
      .order('release_datetime', { ascending: true })

    if (citiesError) throw citiesError

    const scheduled = (cities || []).map((city) => ({
      id: city.id,
      entity_type: 'city' as const,
      entity_id: city.id,
      entity_name: city.name,
      scheduled_date: city.release_datetime,
      action: 'publish' as const,
      status: new Date(city.release_datetime!) <= new Date() && city.status === 'SOON'
        ? 'pending' as const
        : city.status === 'OUT_NOW'
        ? 'completed' as const
        : 'pending' as const,
    }))

    return NextResponse.json({ success: true, posts: scheduled })
  } catch (error: any) {
    console.error('Error fetching scheduled posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scheduled posts' },
      { status: 500 }
    )
  }
}
