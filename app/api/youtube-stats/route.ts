import { NextRequest, NextResponse } from 'next/server'
import { getYouTubeStats, extractVideoId } from '@/lib/youtube-stats'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const videoId = searchParams.get('videoId')
    const url = searchParams.get('url')

    if (!videoId && !url) {
      return NextResponse.json(
        { error: 'videoId or url parameter is required' },
        { status: 400 }
      )
    }

    const finalVideoId = videoId || (url ? extractVideoId(url) : null)

    if (!finalVideoId) {
      return NextResponse.json(
        { error: 'Invalid video ID or URL' },
        { status: 400 }
      )
    }

    const stats = await getYouTubeStats(finalVideoId)

    if (!stats) {
      return NextResponse.json(
        { error: 'Video not found or stats unavailable' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, stats })
  } catch (error: any) {
    console.error('Error fetching YouTube stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch YouTube stats' },
      { status: 500 }
    )
  }
}
