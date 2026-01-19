import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getClientIP, rateLimit, validateString, sanitizeInput, validateObject, validateNumber } from '@/lib/security'

// GET - Fetch recent messages
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`cali-club-messages-get:${clientIP}`, {
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

    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')

    // Validate limit
    const limitValidation = validateNumber(limitParam ? parseInt(limitParam) : 50, {
      min: 1,
      max: 100, // Max 100 messages
      integer: true,
    })

    if (!limitValidation.valid) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      )
    }

    const limit = limitValidation.value || 50

    const { data, error } = await supabaseAdmin
      .from('cali_club_messages')
      .select('id, session_id, character_name, message, created_at') // Don't select all fields
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    return NextResponse.json({ messages: (data || []).reverse() }) // Reverse to show oldest first
  } catch (error: any) {
    console.error('Error in GET /api/cali-club/messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST - Create a new message
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`cali-club-messages:${clientIP}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 20, // 20 messages per minute
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
      character_name: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 50,
      },
      message: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 500, // Limit message length
      },
    })

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const { session_id, character_name, message } = validation.value!

    // Sanitize inputs to prevent XSS
    const sanitizedSessionId = sanitizeInput(session_id)
    const sanitizedName = sanitizeInput(character_name)
    const sanitizedMessage = sanitizeInput(message).trim()

    const { data, error } = await supabaseAdmin
      .from('cali_club_messages')
      .insert({
        session_id: sanitizedSessionId,
        character_name: sanitizedName,
        message: sanitizedMessage,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating message:', error)
      return NextResponse.json(
        { error: 'Failed to create message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: data })
  } catch (error: any) {
    console.error('Error in POST /api/cali-club/messages:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
