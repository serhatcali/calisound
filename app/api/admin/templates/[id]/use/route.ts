import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getTemplate, incrementTemplateUsage } from '@/lib/release-planning-service'

export const dynamic = 'force-dynamic'

// POST: Use a template (increment usage count)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await incrementTemplateUsage(params.id)
    const template = await getTemplate(params.id)

    return NextResponse.json(template)
  } catch (error: any) {
    console.error('[API] Error using template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to use template' },
      { status: 500 }
    )
  }
}
