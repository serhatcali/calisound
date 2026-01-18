import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { is2FAEnabled } from '@/lib/2fa'

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const enabled = await is2FAEnabled()

    return NextResponse.json({ success: true, enabled })
  } catch (error: any) {
    console.error('Error checking 2FA status:', error)
    return NextResponse.json(
      { error: 'Failed to check 2FA status' },
      { status: 500 }
    )
  }
}
