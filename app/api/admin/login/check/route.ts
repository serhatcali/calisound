import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { is2FAEnabled } from '@/lib/2fa'

export const dynamic = 'force-dynamic'

// Debug endpoint to check login status
export async function GET(request: NextRequest) {
  try {
    // Check session cookie directly
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin_session')
    const csrfCookie = cookieStore.get('admin_csrf')
    
    // Verify session
    const { verifySession } = await import('@/lib/session-manager')
    const sessionCheck = await verifySession(request)
    
    const twoFAEnabled = await is2FAEnabled()
    const authenticated = await isAdminAuthenticated(request)
    
    return NextResponse.json({
      authenticated: authenticated || false,
      twoFAEnabled: twoFAEnabled || false,
      hasSessionCookie: !!sessionCookie,
      hasCsrfCookie: !!csrfCookie,
      sessionValid: sessionCheck.valid,
      sessionError: sessionCheck.error,
      message: authenticated 
        ? 'You are logged in' 
        : twoFAEnabled 
          ? '2FA is enabled - you need to verify' 
          : 'Not logged in'
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  } catch (error: any) {
    console.error('Login check error:', error)
    // Return false on error instead of 500
    return NextResponse.json({
      authenticated: false,
      twoFAEnabled: false,
      hasSessionCookie: false,
      hasCsrfCookie: false,
      sessionValid: false,
      message: 'Not logged in',
      error: error.message
    }, { status: 200 }) // Return 200 so client can handle it
  }
}
