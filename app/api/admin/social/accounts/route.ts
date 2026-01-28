import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getSocialAccounts } from '@/lib/social-media-service'

export const dynamic = 'force-dynamic'

// GET: List social accounts
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accounts = await getSocialAccounts()
    return NextResponse.json(accounts)
  } catch (error: any) {
    console.error('[API] Error fetching accounts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}
