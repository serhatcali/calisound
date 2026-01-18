'use client'

import { useState, useEffect } from 'react'
import { getYouTubeStats, extractVideoId, formatViewCount } from '@/lib/youtube-stats'

interface ViewCountProps {
  youtubeUrl: string | null
  className?: string
}

export function ViewCount({ youtubeUrl, className = '' }: ViewCountProps) {
  const [viewCount, setViewCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!youtubeUrl) {
      setLoading(false)
      return
    }

    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      setLoading(false)
      return
    }

    getYouTubeStats(videoId)
      .then((stats) => {
        if (stats) {
          setViewCount(stats.viewCount)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [youtubeUrl])

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
        <span>Loading...</span>
      </div>
    )
  }

  if (!viewCount) {
    return null
  }

  return (
    <div className={`inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 ${className}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
      </svg>
      <span>{formatViewCount(viewCount)}</span>
    </div>
  )
}
