import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'
  validateObject,
  sanitizeInput,
  isValidEmail,
  getClientIP,
  rateLimit,
} from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`contact:${clientIP}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 5, // 5 contact submissions per minute
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
      name: {
        type: 'string',
        required: true,
        minLength: 2,
        maxLength: 100,
      },
      email: {
        type: 'email',
        required: true,
      },
      subject: {
        type: 'string',
        required: false,
        maxLength: 200,
      },
      message: {
        type: 'string',
        required: true,
        minLength: 10,
        maxLength: 5000,
      },
    })

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const { name, email, subject, message } = validation.value!

    // Additional email validation
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name)
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedSubject = subject ? sanitizeInput(subject) : 'No subject'
    const sanitizedMessage = sanitizeInput(message)

    // Save to database (Supabase uses parameterized queries, so SQL injection is protected)
    const { data, error: dbError } = await supabase
      .from('contacts')
      .insert([
        {
          name: sanitizedName,
          email: sanitizedEmail,
          subject: sanitizedSubject,
          message: sanitizedMessage,
        },
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Don't expose database errors to client
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      )
    }

    // Send email (if email service is configured)
    const contactEmail = process.env.CONTACT_EMAIL
    if (contactEmail) {
      // In production, use a service like Resend, SendGrid, or Nodemailer
      console.log('Contact form submission:', {
        to: contactEmail,
        subject: process.env.CONTACT_EMAIL_SUBJECT || 'New Contact Form Submission',
        body: `
Name: ${sanitizedName}
Email: ${sanitizedEmail}
Subject: ${sanitizedSubject}

Message:
${sanitizedMessage}
        `,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    })
  } catch (error: any) {
    console.error('Contact form error:', error)
    // Don't expose error details to client
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}
