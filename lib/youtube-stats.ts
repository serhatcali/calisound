// YouTube Statistics API
// Fetches view counts and statistics from YouTube

interface YouTubeStats {
  viewCount: number
  likeCount?: number
  commentCount?: number
  duration?: string
}

// Extract video ID from YouTube URL
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

// Fetch YouTube video statistics
export async function getYouTubeStats(videoId: string): Promise<YouTubeStats | null> {
  if (!process.env.NEXT_PUBLIC_YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured')
    return null
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=statistics,contentDetails&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
    )

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const video = data.items[0]
    const stats = video.statistics
    const contentDetails = video.contentDetails

    // Parse duration (ISO 8601 format: PT1H2M10S)
    let duration: string | undefined
    if (contentDetails?.duration) {
      const match = contentDetails.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (match) {
        const hours = parseInt(match[1] || '0')
        const minutes = parseInt(match[2] || '0')
        const seconds = parseInt(match[3] || '0')
        if (hours > 0) {
          duration = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        } else {
          duration = `${minutes}:${seconds.toString().padStart(2, '0')}`
        }
      }
    }

    return {
      viewCount: parseInt(stats.viewCount || '0'),
      likeCount: parseInt(stats.likeCount || '0'),
      commentCount: parseInt(stats.commentCount || '0'),
      duration,
    }
  } catch (error) {
    // Only log during runtime, not during build
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.error('Error fetching YouTube stats:', error)
    }
    return null
  }
}

// Format view count for display
export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`
  }
  return `${count} views`
}

// Format like count for display
export function formatLikeCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}
