import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Sitemap is already generated dynamically in app/sitemap.ts
    // This endpoint just confirms it exists
    return NextResponse.json({ 
      success: true, 
      message: 'Sitemap is automatically generated at /sitemap.xml' 
    })
  } catch (error: any) {
    console.error('Error generating sitemap:', error)
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 }
    )
  }
}
