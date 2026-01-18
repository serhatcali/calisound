import { NextRequest, NextResponse } from 'next/server'

// Search Spotify catalog
import { getClientIP, rateLimit, validateString, sanitizeInput, validateNumber } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`spotify-search:${clientIP}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 20, // 20 searches per minute
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
          },
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limitParam = searchParams.get('limit')
    const type = searchParams.get('type') || 'track'

    // Validate query
    const queryValidation = validateString(query, {
      required: true,
      minLength: 1,
      maxLength: 100,
    })

    if (!queryValidation.valid || !queryValidation.value) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required and must be 1-100 characters' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['track', 'album', 'artist', 'playlist']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Type must be one of: track, album, artist, playlist' },
        { status: 400 }
      )
    }

    // Validate limit
    const limitValidation = validateNumber(limitParam ? parseInt(limitParam) : 20, {
      min: 1,
      max: 50, // Limit to 50
      integer: true,
    })

    if (!limitValidation.valid) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      )
    }

    const limit = limitValidation.value || 20
    const sanitizedQuery = sanitizeInput(queryValidation.value)

    // Get access token
    const tokenResponse = await fetch(`${request.nextUrl.origin}/api/spotify/auth`)
    if (!tokenResponse.ok) {
      console.error('Spotify token error')
      return NextResponse.json(
        { error: 'Failed to get Spotify access token' },
        { status: 500 }
      )
    }

    const { access_token } = await tokenResponse.json()

    // Search Spotify API
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(sanitizedQuery)}&type=${type}&limit=${limit}`
    
    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Spotify API error:', errorText)
      return NextResponse.json(
        { error: 'Spotify API request failed' },
        { status: 500 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error searching Spotify:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
