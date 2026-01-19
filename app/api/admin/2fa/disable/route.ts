import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { disable2FA } from '@/lib/2fa'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await disable2FA()

    if (success) {
      return NextResponse.json({ success: true, message: '2FA disabled successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error disabling 2FA:', error)
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    )
  }
}
