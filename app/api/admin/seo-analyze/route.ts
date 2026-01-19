import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { validateString, isValidURL } from '@/lib/security'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    // Validate URL
    const urlValidation = validateString(url, {
      required: true,
      maxLength: 500,
    })

    if (!urlValidation.valid || !urlValidation.value) {
      return NextResponse.json(
        { error: 'URL is required and must be valid' },
        { status: 400 }
      )
    }

    // Validate URL format
    if (!isValidURL(urlValidation.value)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Parse URL to extract path
    const urlObj = new URL(urlValidation.value)
    const path = urlObj.pathname

    // Extract SEO data from path (simplified - in real app, fetch actual page)
    const seoData = {
      title: path.includes('/city/') ? 'City Page' : 'Page',
      description: 'CALI Sound - Global Afro House City Series',
      url: urlValidation.value,
      image: 'https://calisound.com/og-default.jpg',
    }

    return NextResponse.json({ success: true, seoData })
  } catch (error: any) {
    console.error('Error analyzing SEO:', error)
    return NextResponse.json(
      { error: 'Failed to analyze SEO' },
      { status: 500 }
    )
  }
}
