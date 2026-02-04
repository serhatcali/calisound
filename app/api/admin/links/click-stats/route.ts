import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

const MAX_AGGREGATE = 50000
const DEFAULT_PAGE_SIZE = 500
const MAX_PAGE_SIZE = 2000

function deviceFromUserAgent(ua: string | null): 'mobile' | 'desktop' | 'unknown' {
  if (!ua) return 'unknown'
  const u = ua.toLowerCase()
  if (/mobile|android|iphone|ipod|webos|blackberry|iemobile|opera mini/i.test(u)) return 'mobile'
  return 'desktop'
}

type Row = {
  id?: string
  link_type: string
  link_url: string
  clicked_at: string | null
  user_agent?: string | null
  referrer?: string | null
  source_page?: string | null
  source_label?: string | null
}

function mapRow(r: Row) {
  return {
    id: r.id,
    link_type: r.link_type,
    link_url: r.link_url,
    clicked_at: r.clicked_at,
    user_agent: r.user_agent ? String(r.user_agent).slice(0, 200) : null,
    referrer: r.referrer || null,
    source_page: r.source_page || null,
    source_label: r.source_label || null,
    device: deviceFromUserAgent(r.user_agent ?? null),
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || '' // ISO date YYYY-MM-DD
    const to = searchParams.get('to') || ''
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10))
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE), 10)))

    let query = supabaseAdmin
      .from('click_tracking')
      .select('id, link_type, link_url, clicked_at, user_agent, referrer, source_page, source_label', { count: 'exact' })
      .order('clicked_at', { ascending: false })

    if (from) {
      query = query.gte('clicked_at', from + 'T00:00:00.000Z')
    }
    if (to) {
      query = query.lte('clicked_at', to + 'T23:59:59.999Z')
    }

    const isFirstPage = offset === 0
    const rangeStart = offset
    const rangeEnd = isFirstPage ? MAX_AGGREGATE - 1 : offset + limit - 1
    const { data: rows, error, count: totalCount } = await query.range(rangeStart, rangeEnd)

    if (error) {
      console.error('[click-stats] Error fetching clicks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch click stats' },
        { status: 500 }
      )
    }

    const list = (rows || []) as Row[]
    const total_clicks = totalCount ?? list.length

    let stats: { link_type: string; link_url: string; count: number; last_clicked_at: string | null }[] = []
    let bySourceList: { source_page: string; source_label: string; count: number }[] = []

    if (isFirstPage && list.length > 0) {
      const byLink: Record<string, { link_type: string; link_url: string; count: number; last_clicked_at: string | null }> = {}
      const bySource: Record<string, { source_page: string; source_label: string; count: number }> = {}
      for (const r of list) {
        const linkKey = r.link_type
        if (!byLink[linkKey]) {
          byLink[linkKey] = { link_type: r.link_type, link_url: r.link_url, count: 0, last_clicked_at: r.clicked_at }
        }
        byLink[linkKey].count += 1
        if (!byLink[linkKey].last_clicked_at || (r.clicked_at && r.clicked_at > byLink[linkKey].last_clicked_at!)) {
          byLink[linkKey].last_clicked_at = r.clicked_at
        }
        const srcPage = r.source_page || '(bilinmiyor)'
        const srcLabel = r.source_label || r.source_page || '(bilinmiyor)'
        if (!bySource[srcPage]) bySource[srcPage] = { source_page: srcPage, source_label: srcLabel, count: 0 }
        bySource[srcPage].count += 1
      }
      stats = Object.values(byLink).sort((a, b) => b.count - a.count)
      bySourceList = Object.values(bySource).sort((a, b) => b.count - a.count)
    }

    const recent = (isFirstPage ? list.slice(0, limit) : list).map(mapRow)

    return NextResponse.json({
      stats,
      by_source: bySourceList,
      recent,
      total_clicks,
      offset,
      limit,
      has_more: total_clicks > offset + list.length,
    })
  } catch (e: any) {
    console.error('[click-stats] Error:', e)
    return NextResponse.json(
      { error: e.message || 'Unauthorized' },
      { status: e.message?.includes('auth') ? 401 : 500 }
    )
  }
}
