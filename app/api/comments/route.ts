import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  validateObject,
  sanitizeInput,
  isValidEmail,
  getClientIP,
  rateLimit,
  validateString,
  validateNumber,
} from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const entityType = searchParams.get('entity_type')
    const entityId = searchParams.get('entity_id')

    // Validate input
    const entityTypeValidation = validateString(entityType, {
      required: true,
      maxLength: 50,
      pattern: /^[a-z_]+$/, // Only lowercase letters and underscores
    })

    const entityIdValidation = validateString(entityId, {
      required: true,
      maxLength: 100,
    })

    if (!entityTypeValidation.valid || !entityIdValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid entity_type or entity_id' },
        { status: 400 }
      )
    }

    const sanitizedEntityType = entityTypeValidation.value!
    const sanitizedEntityId = entityIdValidation.value!

    // Query with parameterized values (Supabase protects against SQL injection)
    const { data, error } = await supabase
      .from('comments')
      .select('id, author_name, content, rating, created_at')
      .eq('entity_type', sanitizedEntityType)
      .eq('entity_id', sanitizedEntityId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(100) // Limit results to prevent abuse

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, comments: data || [] })
  } catch (error: any) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`comments:${clientIP}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 5, // 5 comments per minute
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

    // Parse and validate input
    const body = await request.json()

    const validation = validateObject(body, {
      entity_type: {
        type: 'string',
        required: true,
        maxLength: 50,
        pattern: /^[a-z_]+$/, // Only lowercase letters and underscores
      },
      entity_id: {
        type: 'string',
        required: true,
        maxLength: 100,
      },
      author_name: {
        type: 'string',
        required: true,
        minLength: 2,
        maxLength: 100,
      },
      author_email: {
        type: 'email',
        required: false,
      },
      content: {
        type: 'string',
        required: true,
        minLength: 10,
        maxLength: 2000,
      },
      rating: {
        type: 'number',
        required: false,
        min: 1,
        max: 5,
        integer: true,
      },
    })

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const {
      entity_type,
      entity_id,
      author_name,
      author_email,
      content,
      rating,
    } = validation.value!

    // Additional email validation if provided
    if (author_email && !isValidEmail(author_email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedEntityType = sanitizeInput(entity_type)
    const sanitizedEntityId = sanitizeInput(entity_id)
    const sanitizedName = sanitizeInput(author_name)
    const sanitizedEmail = author_email ? sanitizeInput(author_email).toLowerCase().trim() : null
    const sanitizedContent = sanitizeInput(content)

    // Get IP and user agent from headers
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Insert comment (Supabase uses parameterized queries)
    const { data, error } = await supabase
      .from('comments')
      .insert({
        entity_type: sanitizedEntityType,
        entity_id: sanitizedEntityId,
        author_name: sanitizedName,
        author_email: sanitizedEmail,
        content: sanitizedContent,
        rating: rating || null,
        status: 'pending', // Requires moderation
        ip_address: ipAddress,
        user_agent: userAgent.substring(0, 500), // Limit user agent length
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json(
        { error: 'Failed to create comment. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, comment: data })
  } catch (error: any) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment. Please try again later.' },
      { status: 500 }
    )
  }
}
