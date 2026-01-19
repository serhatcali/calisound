import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

// POST - Cleanup character (for sendBeacon compatibility)
// This endpoint is called when user leaves/closes browser
export async function POST(request: NextRequest) {
  try {
    // Try to parse JSON body
    let body: any = {}
    try {
      const text = await request.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch (e) {
      // If parsing fails, try to get from URL params (fallback)
      const { searchParams } = new URL(request.url)
      body = {
        id: searchParams.get('id'),
        session_id: searchParams.get('session_id'),
      }
    }

    const { id, session_id } = body

    if (!id && !session_id) {
      return NextResponse.json({ error: 'Missing id or session_id' }, { status: 400 })
    }

    const query = supabaseAdmin.from('cali_club_characters').update({ is_active: false })

    if (id) {
      query.eq('id', id)
    } else if (session_id) {
      query.eq('session_id', session_id)
    }

    const { error } = await query

    if (error) {
      console.error('Error cleaning up character:', error)
      return NextResponse.json({ error: 'Failed to cleanup characters' }, { status: 500 })
    }

    console.log(`✅ Character cleaned up: ${id || session_id}`)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in POST /api/cali-club/characters/cleanup:', error)
    return NextResponse.json({ error: 'Failed to cleanup characters' }, { status: 500 })
  }
}
