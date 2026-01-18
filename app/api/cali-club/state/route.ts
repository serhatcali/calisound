import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getClientIP, rateLimit, validateString, validateNumber, validateObject } from '@/lib/security'

// GET - Get current concert state
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`cali-club-state-get:${clientIP}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 60, // 60 requests per minute
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
          },
        }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('cali_club_state')
      .select('id, current_song_id, is_playing, position, volume, updated_at') // Don't select all
      .eq('id', 'main')
      .single()

    if (error) {
      console.error('Error fetching state:', error)
      return NextResponse.json(
        { error: 'Failed to fetch state' },
        { status: 500 }
      )
    }

    return NextResponse.json({ state: data })
  } catch (error: any) {
    console.error('Error in GET /api/cali-club/state:', error)
    return NextResponse.json(
      { error: 'Failed to fetch state' },
      { status: 500 }
    )
  }
}

// PUT - Update concert state
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`cali-club-state-update:${clientIP}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 30, // 30 updates per minute
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
          },
        }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = validateObject(body, {
      current_song_id: { type: 'string', required: false, maxLength: 100 },
      is_playing: { type: 'boolean', required: false },
      position: { type: 'number', required: false, min: 0, max: 86400 },
      volume: { type: 'number', required: false, min: 0, max: 100 },
    })

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const { current_song_id, is_playing, position, volume } = validation.value!

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (current_song_id !== undefined) {
      const idValidation = validateString(current_song_id, {
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      })
      if (idValidation.valid) {
        updateData.current_song_id = idValidation.value
      }
    }
    if (is_playing !== undefined) updateData.is_playing = is_playing
    if (position !== undefined) updateData.position = position
    if (volume !== undefined) updateData.volume = volume

    const { data, error } = await supabaseAdmin
      .from('cali_club_state')
      .update(updateData)
      .eq('id', 'main')
      .select()
      .single()

    if (error) {
      console.error('Error updating state:', error)
      return NextResponse.json(
        { error: 'Failed to update state' },
        { status: 500 }
      )
    }

    return NextResponse.json({ state: data })
  } catch (error: any) {
    console.error('Error in PUT /api/cali-club/state:', error)
    return NextResponse.json(
      { error: 'Failed to update state' },
      { status: 500 }
    )
  }
}
