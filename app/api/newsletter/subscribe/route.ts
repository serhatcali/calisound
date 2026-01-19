import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  validateObject,
  sanitizeInput,
  isValidEmail,
  getClientIP,
  rateLimit,
} from '@/lib/security'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`newsletter:${clientIP}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 3, // 3 subscriptions per minute
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
      email: {
        type: 'email',
        required: true,
      },
    })

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid email address', details: validation.errors },
        { status: 400 }
      )
    }

    const { email } = validation.value!

    // Additional email validation
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Sanitize email
    const sanitizedEmail = sanitizeInput(email).toLowerCase().trim()

    // Save to database (Supabase uses parameterized queries, so SQL injection is protected)
    const { data, error: dbError } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email: sanitizedEmail, subscribed_at: new Date().toISOString() }])
      .select()
      .single()

    if (dbError) {
      // If duplicate, that's okay
      if (dbError.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'Already subscribed',
        })
      }
      // Don't expose database errors to client
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again later.' },
        { status: 500 }
      )
    }

    // In production, integrate with email service (Mailchimp, ConvertKit, etc.)
    console.log('Newsletter subscription:', sanitizedEmail)

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed',
    })
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    // Don't expose error details to client
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    )
  }
}
