import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getRelease, updateRelease } from '@/lib/release-planning-service'

export const dynamic = 'force-dynamic'

// GET: Get single release
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const release = await getRelease(params.id)
    return NextResponse.json(release)
  } catch (error: any) {
    console.error('[API] Error fetching release:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch release' },
      { status: 500 }
    )
  }
}

// PATCH: Update release
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const release = await updateRelease(params.id, body)
    
    return NextResponse.json(release)
  } catch (error: any) {
    console.error('[API] Error updating release:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update release' },
      { status: 500 }
    )
  }
}

// DELETE: Delete release
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deleteRelease } = await import('@/lib/release-planning-service')
    await deleteRelease(params.id)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] Error deleting release:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete release' },
      { status: 500 }
    )
  }
}
