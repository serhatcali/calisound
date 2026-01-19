import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

// Search YouTube Music (using YouTube Data API v3)
import { getClientIP, rateLimit, validateString, sanitizeInput, validateNumber } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`youtube-search:${clientIP}`, {
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
    const maxResultsParam = searchParams.get('maxResults')

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

    // Validate maxResults
    const maxResultsValidation = validateNumber(maxResultsParam ? parseInt(maxResultsParam) : 20, {
      min: 1,
      max: 50, // Limit to 50
      integer: true,
    })

    if (!maxResultsValidation.valid) {
      return NextResponse.json(
        { error: 'maxResults must be between 1 and 50' },
        { status: 400 }
      )
    }

    const maxResults = maxResultsValidation.value || 20
    const sanitizedQuery = sanitizeInput(queryValidation.value)

    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'YouTube API key not configured',
          message: 'Please set NEXT_PUBLIC_YOUTUBE_API_KEY in .env.local',
        },
        { status: 500 }
      )
    }

    // Search YouTube for music videos
    // Using 'music' in query to get music-related results
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(sanitizedQuery + ' music')}&type=video&maxResults=${maxResults}&key=${apiKey}`

    const response = await fetch(searchUrl)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('YouTube API error:', errorText)
      return NextResponse.json(
        { error: 'YouTube API request failed' },
        { status: 500 }
      )
    }

    const data = await response.json()

    // Format results for our use case
    const formattedResults = (data.items || []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
      publishedAt: item.snippet.publishedAt,
      youtube_url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      embed_url: `https://www.youtube.com/embed/${item.id.videoId}`,
    }))

    return NextResponse.json({ items: formattedResults })
  } catch (error: any) {
    console.error('Error searching YouTube Music:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
