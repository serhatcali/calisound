import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { is2FAEnabled } from '@/lib/2fa'

export const dynamic = 'force-dynamic'

// Debug endpoint to check login status
export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAdminAuthenticated(request)
    const twoFAEnabled = await is2FAEnabled()
    
    return NextResponse.json({
      authenticated,
      twoFAEnabled,
      message: authenticated 
        ? 'You are logged in' 
        : twoFAEnabled 
          ? '2FA is enabled - you need to verify' 
          : 'Not logged in'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to check status', details: error.message },
      { status: 500 }
    )
  }
}
