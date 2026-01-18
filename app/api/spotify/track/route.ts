import { NextRequest, NextResponse } from 'next/server'

// Get track details by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackId = searchParams.get('id')

    if (!trackId) {
      return NextResponse.json({ error: 'Track ID parameter is required' }, { status: 400 })
    }

    // Get access token
    const tokenResponse = await fetch(`${request.nextUrl.origin}/api/spotify/auth`)
    if (!tokenResponse.ok) {
      const error = await tokenResponse.json()
      return NextResponse.json(
        { error: 'Failed to get Spotify access token', details: error },
        { status: 500 }
      )
    }

    const { access_token } = await tokenResponse.json()

    // Get track from Spotify API
    const trackUrl = `https://api.spotify.com/v1/tracks/${trackId}`
    
    const response = await fetch(trackUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Spotify API error:', errorText)
      return NextResponse.json(
        { error: 'Spotify API request failed', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error getting Spotify track:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
