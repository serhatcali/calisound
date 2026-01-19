import { NextRequest, NextResponse } from 'next/server'
import { verify2FAToken } from '@/lib/2fa'
import { cookies } from 'next/headers'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

import { getClientIP, rateLimit, validateString } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // Aggressive rate limiting for 2FA verification
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`2fa-verify:${clientIP}`, {
      windowMs: 300000, // 5 minutes
      maxRequests: 10, // 10 attempts per 5 minutes
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
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
    const tokenValidation = validateString(body.token, {
      required: true,
      minLength: 6,
      maxLength: 6,
      pattern: /^\d{6}$/, // 6 digits
    })

    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: 'Token must be a 6-digit number' },
        { status: 400 }
      )
    }

    const { token } = tokenValidation.value!

    // Don't log sensitive token data
    const isValid = await verify2FAToken(token)

    if (isValid) {
      // Set 2FA verified cookie
      const cookieStore = await cookies()
      cookieStore.set('admin-2fa-verified', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // Changed from 'lax' to 'strict' for better security
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ 
        error: 'Invalid code. Please make sure you entered the correct 6-digit code from your authenticator app.' 
      }, { status: 401 })
    }
  } catch (error: any) {
    console.error('Error verifying 2FA token:', error)
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    )
  }
}
