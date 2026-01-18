import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isAdminPending2FA } from '@/lib/admin-auth'
import { createSession, getClientIP } from '@/lib/session-manager'

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

    // Create secure session instead of simple cookie
    await createSession('admin', ipAddress, userAgent)

    // Delete temp cookie
    cookieStore.delete('admin-auth-temp')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error completing login:', error)
    return NextResponse.json(
      { error: 'Failed to complete login' },
      { status: 500 }
    )
  }
}
