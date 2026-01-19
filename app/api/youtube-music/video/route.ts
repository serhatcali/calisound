import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

// Get video details by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('id')

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID parameter is required' }, { status: 400 })
    }

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

    // Get video details from YouTube API
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`

    const response = await fetch(videoUrl)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('YouTube API error:', errorText)
      return NextResponse.json(
        { error: 'YouTube API request failed', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const video = data.items[0]

    // Parse duration (ISO 8601 format: PT4M13S)
    const durationMatch = video.contentDetails.duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    let durationSeconds = 0
    if (durationMatch) {
      const hours = parseInt(durationMatch[1] || '0')
      const minutes = parseInt(durationMatch[2] || '0')
      const seconds = parseInt(durationMatch[3] || '0')
      durationSeconds = hours * 3600 + minutes * 60 + seconds
    }

    const formattedVideo = {
      id: video.id,
      title: video.snippet.title,
      artist: video.snippet.channelTitle,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url,
      publishedAt: video.snippet.publishedAt,
      duration: durationSeconds,
      youtube_url: `https://www.youtube.com/watch?v=${video.id}`,
      embed_url: `https://www.youtube.com/embed/${video.id}`,
    }

    return NextResponse.json(formattedVideo)
  } catch (error: any) {
    console.error('Error getting YouTube video:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
