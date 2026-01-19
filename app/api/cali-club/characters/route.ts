import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getClientIP, rateLimit, validateString, validateObject, sanitizeInput, validateNumber } from '@/lib/security'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

// GET - Fetch all active characters
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('cali_club_characters')
      .select('id, session_id, name, gender, avatar_data, position, rotation, is_active, created_at, updated_at') // Don't select all fields
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching characters:', error)
      return NextResponse.json(
        { error: 'Failed to fetch characters' },
        { status: 500 }
      )
    }

    return NextResponse.json({ characters: data || [] })
  } catch (error: any) {
    console.error('Error in GET /api/cali-club/characters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    )
  }
}

// POST - Create a new character
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`cali-club-characters:${clientIP}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 5, // 5 character creations per minute
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
      session_id: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 100,
      },
      name: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 50,
      },
      gender: {
        type: 'string',
        required: true,
        pattern: /^(male|female)$/,
      },
    })

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const { session_id, name, gender, avatar_data, position } = validation.value!

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name)
    const sanitizedSessionId = sanitizeInput(session_id)

    // Validate position if provided
    let validPosition = { x: 0, y: 0, z: 0 }
    if (position) {
      const xValidation = validateNumber(position.x, { min: -100, max: 100 })
      const yValidation = validateNumber(position.y, { min: -10, max: 10 })
      const zValidation = validateNumber(position.z, { min: -100, max: 100 })
      
      if (xValidation.valid && yValidation.valid && zValidation.valid) {
        validPosition = {
          x: xValidation.value || 0,
          y: yValidation.value || 0,
          z: zValidation.value || 0,
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('cali_club_characters')
      .insert({
        session_id: sanitizedSessionId,
        name: sanitizedName,
        gender,
        avatar_data: avatar_data || {},
        position: validPosition,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating character:', error)
      return NextResponse.json(
        { error: 'Failed to create character' },
        { status: 500 }
      )
    }

    return NextResponse.json({ character: data })
  } catch (error: any) {
    console.error('Error in POST /api/cali-club/characters:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update character position
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`cali-club-update:${clientIP}`, {
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

    // Validate ID
    const idValidation = validateString(body.id, {
      required: true,
      pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    })

    if (!idValidation.valid) {
      return NextResponse.json({ error: 'Invalid character ID' }, { status: 400 })
    }

    const { id, position, rotation } = body

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Validate and sanitize position
    if (position) {
      const xValidation = validateNumber(position.x, { min: -100, max: 100 })
      const yValidation = validateNumber(position.y, { min: -10, max: 10 })
      const zValidation = validateNumber(position.z, { min: -100, max: 100 })
      
      if (xValidation.valid && yValidation.valid && zValidation.valid) {
        updateData.position = {
          x: xValidation.value || 0,
          y: yValidation.value || 0,
          z: zValidation.value || 0,
        }
      }
    }

    // Validate and sanitize rotation
    if (rotation) {
      const xValidation = validateNumber(rotation.x, { min: -Math.PI * 2, max: Math.PI * 2 })
      const yValidation = validateNumber(rotation.y, { min: -Math.PI * 2, max: Math.PI * 2 })
      const zValidation = validateNumber(rotation.z, { min: -Math.PI * 2, max: Math.PI * 2 })
      
      if (xValidation.valid && yValidation.valid && zValidation.valid) {
        updateData.rotation = {
          x: xValidation.value || 0,
          y: yValidation.value || 0,
          z: zValidation.value || 0,
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('cali_club_characters')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating character:', error)
      return NextResponse.json(
        { error: 'Failed to update character' },
        { status: 500 }
      )
    }

    return NextResponse.json({ character: data })
  } catch (error: any) {
    console.error('Error in PUT /api/cali-club/characters:', error)
    return NextResponse.json({ error: 'Failed to update character' }, { status: 500 })
  }
}

// DELETE - Remove character (set inactive)
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`cali-club-delete:${clientIP}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 10, // 10 deletions per minute
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const sessionId = searchParams.get('session_id')

    // Validate at least one ID is provided
    if (!id && !sessionId) {
      return NextResponse.json({ error: 'Missing id or session_id' }, { status: 400 })
    }

    // Validate ID format if provided
    if (id) {
      const idValidation = validateString(id, {
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      })
      if (!idValidation.valid) {
        return NextResponse.json({ error: 'Invalid character ID' }, { status: 400 })
      }
    }

    if (sessionId) {
      const sessionValidation = validateString(sessionId, {
        minLength: 1,
        maxLength: 100,
      })
      if (!sessionValidation.valid) {
        return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
      }
    }

    const query = supabaseAdmin.from('cali_club_characters').update({ is_active: false })

    if (id) {
      query.eq('id', id)
    } else if (sessionId) {
      query.eq('session_id', sessionId)
    }

    const { error } = await query

    if (error) {
      console.error('Error deleting character:', error)
      return NextResponse.json(
        { error: 'Failed to delete character' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/cali-club/characters:', error)
    return NextResponse.json({ error: 'Failed to update character' }, { status: 500 })
  }
}
