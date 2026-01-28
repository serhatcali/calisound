import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getTemplates, createTemplate } from '@/lib/release-planning-service'

export const dynamic = 'force-dynamic'

// GET: List all templates
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const isPublic = searchParams.get('is_public')
    const tags = searchParams.get('tags')?.split(',')
    const search = searchParams.get('search')

    const templates = await getTemplates({
      is_public: isPublic ? isPublic === 'true' : undefined,
      tags: tags && tags.length > 0 ? tags : undefined,
      search: search || undefined,
    })

    return NextResponse.json(templates)
  } catch (error: any) {
    console.error('[API] Error fetching templates:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST: Create a new template
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const template = await createTemplate(body)

    return NextResponse.json(template, { status: 201 })
  } catch (error: any) {
    console.error('[API] Error creating template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    )
  }
}
