import { NextRequest, NextResponse } from 'next/server'
import { verify2FAToken } from '@/lib/2fa'
import { cookies } from 'next/headers'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

import { getClientIP, rateLimit, validateString } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // Check if 2FA is enabled FIRST - if enabled, always allow verification
    const { is2FAEnabled } = await import('@/lib/2fa')
    const twoFAEnabled = await is2FAEnabled()
    
    // Check if user has pending 2FA (temp auth cookie) OR valid session
    const cookieStore = await cookies()
    const tempAuth = cookieStore.get('admin-auth-temp')
    const sessionCookie = cookieStore.get('admin_session')
    
    console.log('[2FA Verify] Auth check:', {
      hasTempAuth: !!tempAuth?.value,
      hasSession: !!sessionCookie?.value,
      twoFAEnabled,
    })
    
    // If 2FA is enabled, always allow verification attempts (even without session/temp auth)
    // This allows re-verification after session expires
    if (!twoFAEnabled && !tempAuth?.value && !sessionCookie?.value) {
      console.log('[2FA Verify] No auth and 2FA disabled - rejecting')
      return NextResponse.json(
        { error: 'No pending 2FA verification. Please login again.' },
        { status: 401 }
      )
    }
    
    // If 2FA is enabled, proceed with verification (no auth check needed)
    if (twoFAEnabled) {
      console.log('[2FA Verify] 2FA enabled - allowing verification attempt')
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

    console.log('[2FA Verify] Verifying token:', token.substring(0, 2) + '****')

    // Verify token with detailed error handling
    let isValid = false
    let verifyError: Error | null = null
    
    try {
      isValid = await verify2FAToken(token)
      console.log('[2FA Verify] Token verification result:', isValid)
    } catch (error: any) {
      console.error('[2FA Verify] Exception during verification:', error)
      verifyError = error
    }

    // In development, provide more debugging info
    if (!isValid) {
      // Check if secret exists
      const { get2FASecret } = await import('@/lib/2fa')
      const secret = await get2FASecret()
      
      console.log('[2FA Verify] Secret check:', {
        hasSecret: !!secret,
        secretLength: secret?.length,
        secretFormat: secret ? /^[A-Z2-7]+$/.test(secret) : false,
      })
      
      if (!secret) {
        return NextResponse.json({ 
          error: '2FA is not set up. Please set up 2FA first in the admin settings.' 
        }, { status: 400 })
      }
      
      // Generate test token for debugging
      if (process.env.NODE_ENV !== 'production') {
        const { authenticator } = await import('otplib')
        const testToken = authenticator.generate(secret)
        console.log('[2FA Verify] Test token for current time:', testToken)
      }
    }
    
    // If there was an exception, return error
    if (verifyError) {
      console.error('[2FA Verify] Verification error:', verifyError)
      return NextResponse.json({ 
        error: `Verification failed: ${verifyError.message || 'Unknown error'}. Please check server logs.` 
      }, { status: 500 })
    }

    if (isValid) {
      // Set 2FA verified cookie
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
      
      // If no session exists but 2FA is verified, create a session
      // This allows re-verification after session expires
      if (!sessionCookie?.value && !tempAuth?.value) {
        const { createSession, getClientIP } = await import('@/lib/session-manager')
        const ipAddress = getClientIP(request)
        const userAgent = request.headers.get('user-agent') || 'unknown'
        const sessionResult = await createSession('admin', ipAddress, userAgent)
        
        // Set session cookies in response
        const { setSessionCookies } = await import('@/lib/session-manager')
        setSessionCookies(response, sessionResult.sessionToken, sessionResult.csrfToken)
        
        console.log('[2FA Verify] Created new session after 2FA verification')
      }

      return response
    } else {
      // More helpful error message
      return NextResponse.json({ 
        error: 'Invalid code. Please check:\n1. The code is from the correct authenticator app\n2. Your device time is synchronized\n3. You entered all 6 digits correctly\n4. The code hasn\'t expired (codes refresh every 30 seconds)' 
      }, { status: 401 })
    }
  } catch (error: any) {
    console.error('[2FA Verify] Exception in route handler:', error)
    console.error('[2FA Verify] Error message:', error.message)
    console.error('[2FA Verify] Error stack:', error.stack)
    console.error('[2FA Verify] Error name:', error.name)
    
    // Return detailed error in development
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'Failed to verify token. Please try again.'
      : `Failed to verify token: ${error.message || 'Unknown error'}. Check server logs.`
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
