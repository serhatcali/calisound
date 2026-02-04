import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()

    // Aggregate: link_type, count, last_clicked_at
    const { data: rows, error: aggError } = await supabaseAdmin
      .from('click_tracking')
      .select('id, link_type, link_url, clicked_at, user_agent, referrer')
      .order('clicked_at', { ascending: false })

    if (aggError) {
      console.error('[click-stats] Error fetching clicks:', aggError)
      return NextResponse.json(
        { error: 'Failed to fetch click stats' },
        { status: 500 }
      )
    }

    const byLink: Record<
      string,
      { link_type: string; link_url: string; count: number; last_clicked_at: string | null }
    > = {}
    for (const r of rows || []) {
      const key = r.link_type
      if (!byLink[key]) {
        byLink[key] = {
          link_type: r.link_type,
          link_url: r.link_url,
          count: 0,
          last_clicked_at: r.clicked_at,
        }
      }
      byLink[key].count += 1
      if (!byLink[key].last_clicked_at || (r.clicked_at && r.clicked_at > byLink[key].last_clicked_at!)) {
        byLink[key].last_clicked_at = r.clicked_at
      }
    }

    const stats = Object.values(byLink).sort((a, b) => b.count - a.count)

    // Recent clicks: last 50
    const recent = (rows || []).slice(0, 50).map((r: { id?: string; link_type: string; link_url: string; clicked_at: string | null; user_agent?: string | null; referrer?: string | null }) => ({
      id: r.id,
      link_type: r.link_type,
      link_url: r.link_url,
      clicked_at: r.clicked_at,
      user_agent: r.user_agent ? String(r.user_agent).slice(0, 80) : null,
      referrer: r.referrer || null,
    }))

    return NextResponse.json({
      stats,
      recent,
      total_clicks: rows?.length ?? 0,
    })
  } catch (e: any) {
    console.error('[click-stats] Error:', e)
    return NextResponse.json(
      { error: e.message || 'Unauthorized' },
      { status: e.message?.includes('auth') ? 401 : 500 }
    )
  }
}
