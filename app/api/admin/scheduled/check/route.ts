import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { logActivity } from '@/lib/activity-logs'

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get cities with release_datetime that should be published
    const now = new Date().toISOString()
    const { data: cities, error } = await supabase
      .from('cities')
      .select('id, name, release_datetime, status')
      .eq('status', 'SOON')
      .not('release_datetime', 'is', null)
      .lte('release_datetime', now)

    if (error) throw error

    let count = 0
    for (const city of cities || []) {
      const { error: updateError } = await supabase
        .from('cities')
        .update({ status: 'OUT_NOW' })
        .eq('id', city.id)

      if (!updateError) {
        count++
        await logActivity('update', 'city', city.id, city.name, {
          status: { from: 'SOON', to: 'OUT_NOW' },
        })
      }
    }

    return NextResponse.json({
      success: true,
      count,
      message: `Published ${count} cities`,
    })
  } catch (error: any) {
    console.error('Error checking scheduled posts:', error)
    return NextResponse.json(
      { error: 'Failed to check scheduled posts' },
      { status: 500 }
    )
  }
}
