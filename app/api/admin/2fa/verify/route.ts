import { NextRequest, NextResponse } from 'next/server'
import { verify2FAToken } from '@/lib/2fa'
import { cookies } from 'next/headers'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

import { getClientIP, rateLimit, validateString } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // Check if user has pending 2FA (temp auth cookie) OR valid session
    const cookieStore = await cookies()
    const tempAuth = cookieStore.get('admin-auth-temp')
    const sessionCookie = cookieStore.get('admin_session')
    
    // Check if 2FA is enabled
    const { is2FAEnabled } = await import('@/lib/2fa')
    const twoFAEnabled = await is2FAEnabled()
    
    // If 2FA is enabled, allow verification if:
    // 1. Temp auth exists (during login)
    // 2. Session exists (re-verification after session expires but 2FA verified cookie is missing)
    // 3. Or if 2FA is enabled, we should allow verification attempts (user might be re-verifying)
    if (!tempAuth?.value && !sessionCookie?.value && twoFAEnabled) {
      // If 2FA is enabled but no session/temp auth, still allow verification
      // The token verification itself will fail if invalid, but we allow the attempt
      console.log('[2FA Verify] No temp auth or session, but 2FA is enabled - allowing verification attempt')
    } else if (!tempAuth?.value && !sessionCookie?.value && !twoFAEnabled) {
      return NextResponse.json(
        { error: 'No pending 2FA verification. Please login again.' },
        { status: 401 }
      )
    }

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

    // Verify token
    const isValid = await verify2FAToken(token)

    // In development, provide more debugging info
    if (!isValid && process.env.NODE_ENV !== 'production') {
      // Check if secret exists
      const { get2FASecret } = await import('@/lib/2fa')
      const secret = await get2FASecret()
      
      if (!secret) {
        return NextResponse.json({ 
          error: '2FA is not set up. Please set up 2FA first in the admin settings.' 
        }, { status: 400 })
      }
    }

    if (isValid) {
      // Set 2FA verified cookie
      const cookieStore = await cookies()
      const response = NextResponse.json({ success: true })
      
      // Set cookie in response (works in API routes)
      const isProduction = process.env.NODE_ENV === 'production'
      const isVercel = !!process.env.VERCEL
      const isSecure = isProduction && isVercel
      
      response.cookies.set('admin-2fa-verified', 'true', {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })

      return response
    } else {
      // More helpful error message
      return NextResponse.json({ 
        error: 'Invalid code. Please check:\n1. The code is from the correct authenticator app\n2. Your device time is synchronized\n3. You entered all 6 digits correctly\n4. The code hasn\'t expired (codes refresh every 30 seconds)' 
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
