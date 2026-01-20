import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isAdminPending2FA } from '@/lib/admin-auth'
import { createSession, getClientIP } from '@/lib/session-manager'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Check if 2FA is verified (this is the main requirement)
    const twoFAVerified = cookieStore.get('admin-2fa-verified')
    if (twoFAVerified?.value !== 'true') {
      return NextResponse.json({ error: '2FA not verified' }, { status: 401 })
    }

    // Check if already has a valid session
    const { verifySession } = await import('@/lib/session-manager')
    const sessionCheck = await verifySession(request)
    if (sessionCheck.valid) {
      console.log('[Login Complete] Session already valid, skipping creation')
      const response = NextResponse.json({ success: true, message: 'Already authenticated' })
      // Clean up temp cookies
      response.cookies.delete('admin-auth-temp')
      return response
    }

    // If no pending 2FA but 2FA is verified, we can still create a session
    // This allows re-login after session expires
    const pending2FA = await isAdminPending2FA()
    if (!pending2FA) {
      console.log('[Login Complete] No pending 2FA but 2FA verified, creating session anyway')
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

    // Check if cookies were set in response object
    const sessionCookieInResponse = response.cookies.get('admin_session')
    const csrfCookieInResponse = response.cookies.get('admin_csrf')
    console.log('[Login Complete] Cookies in response object:', {
      hasSessionCookie: !!sessionCookieInResponse,
      hasCsrfCookie: !!csrfCookieInResponse,
      sessionCookieValue: sessionCookieInResponse?.value ? sessionCookieInResponse.value.substring(0, 30) + '...' : null,
      csrfCookieValue: csrfCookieInResponse?.value,
    })

    // Check if cookies were set in headers
    const setCookieHeaders = response.headers.getSetCookie()
    console.log('[Login Complete] Set-Cookie headers:', setCookieHeaders)
    console.log('[Login Complete] Set-Cookie headers count:', setCookieHeaders.length)
    
    // Verify admin_session is in headers
    const hasSessionInHeaders = setCookieHeaders.some(header => header.startsWith('admin_session='))
    const hasCsrfInHeaders = setCookieHeaders.some(header => header.startsWith('admin_csrf='))
    console.log('[Login Complete] Cookie presence in headers:', {
      hasSessionInHeaders,
      hasCsrfInHeaders,
    })

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
