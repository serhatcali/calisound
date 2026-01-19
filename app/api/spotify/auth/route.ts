import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

// Get Spotify access token (Client Credentials Flow)
export async function GET() {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          error: 'Spotify credentials not configured',
          message: 'Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local',
        },
        { status: 500 }
      )
    }

    // Get access token from Spotify
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Spotify token error:', errorText)
      return NextResponse.json(
        { error: 'Failed to get Spotify access token', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ access_token: data.access_token, expires_in: data.expires_in })
  } catch (error: any) {
    console.error('Error getting Spotify token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
