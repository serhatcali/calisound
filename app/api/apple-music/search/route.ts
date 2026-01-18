import { NextRequest, NextResponse } from 'next/server'

// Search Apple Music catalog
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '25')
    const types = searchParams.get('types') || 'songs'

    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    // Get developer token
    const tokenResponse = await fetch(`${request.nextUrl.origin}/api/apple-music/developer-token`)
    if (!tokenResponse.ok) {
      const error = await tokenResponse.json()
      return NextResponse.json(
        { error: 'Failed to get developer token', details: error },
        { status: 500 }
      )
    }

    const { token } = await tokenResponse.json()

    // Search Apple Music API
    const searchUrl = `https://api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(query)}&limit=${limit}&types=${types}`
    
    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Apple Music API error:', errorText)
      return NextResponse.json(
        { error: 'Apple Music API request failed', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error searching Apple Music:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
