import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

const MAX_EXPORT = 100000

function escapeCsv(s: string | null | undefined): string {
  if (s == null) return ''
  const t = String(s)
  if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`
  return t
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''

    let query = supabaseAdmin
      .from('click_tracking')
      .select('id, link_type, link_url, clicked_at, user_agent, referrer, source_page, source_label')
      .order('clicked_at', { ascending: false })
      .limit(MAX_EXPORT)

    if (from) query = query.gte('clicked_at', from + 'T00:00:00.000Z')
    if (to) query = query.lte('clicked_at', to + 'T23:59:59.999Z')

    const { data: rows, error } = await query

    if (error) {
      console.error('[click-stats export] Error:', error)
      return NextResponse.json({ error: 'Export failed' }, { status: 500 })
    }

    const header = 'id,link_type,link_url,clicked_at,source_page,source_label,referrer,user_agent'
    const lines = [header]
    for (const r of rows || []) {
      lines.push([
        escapeCsv((r as any).id),
        escapeCsv(r.link_type),
        escapeCsv(r.link_url),
        escapeCsv(r.clicked_at),
        escapeCsv((r as any).source_page),
        escapeCsv((r as any).source_label),
        escapeCsv((r as any).referrer),
        escapeCsv((r as any).user_agent),
      ].join(','))
    }

    const csv = '\uFEFF' + lines.join('\r\n')
    const filename = from && to
      ? `click-tracking-${from}-${to}.csv`
      : from
        ? `click-tracking-from-${from}.csv`
        : to
          ? `click-tracking-until-${to}.csv`
          : `click-tracking-${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (e: any) {
    console.error('[click-stats export] Error:', e)
    return NextResponse.json(
      { error: e.message || 'Unauthorized' },
      { status: e.message?.includes('auth') ? 401 : 500 }
    )
  }
}
