import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { 
  updateTagPack, 
  deleteTagPack 
} from '@/lib/social-media-service'
import { getClientIP, rateLimit, validateString } from '@/lib/security'

export const dynamic = 'force-dynamic'

// PUT: Update tag pack
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-tagpack-update:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 30,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()

    if (body.name !== undefined) {
      const nameValidation = validateString(body.name, {
        minLength: 1,
        maxLength: 100,
      })
      if (!nameValidation.valid) {
        return NextResponse.json(
          { error: 'Name must be 1-100 characters' },
          { status: 400 }
        )
      }
    }

    const pack = await updateTagPack(params.id, body)
    return NextResponse.json(pack)
  } catch (error: any) {
    console.error('[API] Error updating tag pack:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update tag pack' },
      { status: 500 }
    )
  }
}

// DELETE: Delete tag pack
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteTagPack(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] Error deleting tag pack:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete tag pack' },
      { status: 500 }
    )
  }
}
