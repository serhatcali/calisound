import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { deleteSocialAccount } from '@/lib/social-media-service'

export const dynamic = 'force-dynamic'

// DELETE: Disconnect social account
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteSocialAccount(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] Error deleting account:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    )
  }
}
