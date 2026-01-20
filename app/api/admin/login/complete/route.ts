import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isAdminPending2FA } from '@/lib/admin-auth'
import { createSession, getClientIP } from '@/lib/session-manager'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const pending2FA = await isAdminPending2FA()

    if (!pending2FA) {
      return NextResponse.json(
        { error: 'Not pending 2FA verification' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    // Check if 2FA is verified
    const twoFAVerified = cookieStore.get('admin-2fa-verified')
    if (twoFAVerified?.value !== 'true') {
      return NextResponse.json({ error: '2FA not verified' }, { status: 401 })
    }

    // Get IP and User-Agent for secure session
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    console.log('[Login Complete] Creating session...', {
      ipAddress,
      userAgent: userAgent.substring(0, 50),
    })
    
    // Create secure session and get session data
    const sessionResult = await createSession('admin', ipAddress, userAgent)

    console.log('[Login Complete] Session created:', {
      hasSessionToken: !!sessionResult.sessionToken,
      hasCsrfToken: !!sessionResult.csrfToken,
      sessionTokenLength: sessionResult.sessionToken?.length,
      csrfTokenLength: sessionResult.csrfToken?.length,
    })

    // Create response
    const response = NextResponse.json({ success: true })
    
    // Set session cookies in response
    const { setSessionCookies } = await import('@/lib/session-manager')
    setSessionCookies(response, sessionResult.sessionToken, sessionResult.csrfToken)

    // Check if cookies were set
    const setCookieHeaders = response.headers.getSetCookie()
    console.log('[Login Complete] Set-Cookie headers:', setCookieHeaders)

    // Delete temp auth cookie (keep admin-2fa-verified for session validation)
    response.cookies.delete('admin-auth-temp')
    console.log('[Login Complete] Deleted admin-auth-temp cookie')
    
    // Note: admin-2fa-verified is kept for session validation in isAdminAuthenticated
    // It will expire naturally or be cleared on logout

    console.log('[Login Complete] Session created and cookies set')

    return response
  } catch (error: any) {
    console.error('Error completing login:', error)
    return NextResponse.json(
      { error: 'Failed to complete login' },
      { status: 500 }
    )
  }
}
