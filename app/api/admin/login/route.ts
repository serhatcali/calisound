import { NextRequest, NextResponse } from 'next/server'
import { loginAdmin } from '@/lib/admin-auth'
import { getClientIP, rateLimit, validateString } from '@/lib/security'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Aggressive rate limiting for login attempts
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`admin-login:${clientIP}`, {
      windowMs: 900000, // 15 minutes
      maxRequests: 5, // 5 login attempts per 15 minutes
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many login attempts. Please try again later.',
        },
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
    const passwordValidation = validateString(body.password, {
      required: true,
      minLength: 1,
      maxLength: 500, // Reasonable max length
    })

    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      )
    }

    // Get IP and User-Agent for session
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const result = await loginAdmin(
      passwordValidation.value!,
      ipAddress,
      userAgent
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        requires2FA: result.requires2FA || false,
      })
    } else {
      // Don't reveal whether the password was wrong or user doesn't exist
      // Add delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 100))
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    )
  }
}
