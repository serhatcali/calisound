import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getTemplate, updateTemplate, deleteTemplate, incrementTemplateUsage } from '@/lib/release-planning-service'

export const dynamic = 'force-dynamic'

// GET: Get a single template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const template = await getTemplate(params.id)
    return NextResponse.json(template)
  } catch (error: any) {
    console.error('[API] Error fetching template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

// PATCH: Update a template
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const template = await updateTemplate(params.id, body)

    return NextResponse.json(template)
  } catch (error: any) {
    console.error('[API] Error updating template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteTemplate(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] Error deleting template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    )
  }
}
