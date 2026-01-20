import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/session-manager'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin_session')
    const csrfCookie = cookieStore.get('admin_csrf')
    
    const sessionCheck = await verifySession(request)
    
    return NextResponse.json({
      cookies: {
        hasSessionCookie: !!sessionCookie,
        sessionCookieLength: sessionCookie?.value?.length,
        sessionCookiePreview: sessionCookie?.value ? sessionCookie.value.substring(0, 50) + '...' : null,
        hasCsrfCookie: !!csrfCookie,
        csrfCookieValue: csrfCookie?.value,
        allCookies: cookieStore.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })),
      },
      session: {
        valid: sessionCheck.valid,
        error: sessionCheck.error,
        hasSessionData: !!sessionCheck.sessionData,
        sessionData: sessionCheck.sessionData ? {
          userId: sessionCheck.sessionData.userId,
          createdAt: new Date(sessionCheck.sessionData.createdAt).toISOString(),
          lastActivity: new Date(sessionCheck.sessionData.lastActivity).toISOString(),
        } : null,
      },
      env: {
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL,
        hasSessionSecret: !!process.env.SESSION_SECRET,
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
