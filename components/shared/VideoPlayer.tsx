'use client'

import { useEffect, useRef, useState } from 'react'
import { trackActions } from '@/lib/analytics'

interface VideoPlayerProps {
  videoId: string
  title: string
  className?: string
  autoplay?: boolean
  onPlay?: () => void
  onPause?: () => void
  onEnd?: () => void
}

export function VideoPlayer({
  videoId,
  title,
  className = '',
  autoplay = false,
  onPlay,
  onPause,
  onEnd,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  // YouTube iframe API için
  useEffect(() => {
    // YouTube iframe API script yükleme
    if (typeof window !== 'undefined' && !(window as any).YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    // YouTube player hazır olduğunda
    const handleYouTubeReady = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        // Player hazır
      }
    }

    if ((window as any).YT) {
      handleYouTubeReady()
    } else {
      ;(window as any).onYouTubeIframeAPIReady = handleYouTubeReady
    }

    return () => {
      if ((window as any).onYouTubeIframeAPIReady) {
        delete (window as any).onYouTubeIframeAPIReady
      }
    }
  }, [])

  const handlePlay = () => {
    setIsPlaying(true)
    trackActions.videoPlay(videoId, title)
    onPlay?.()
  }

  const handlePause = () => {
    setIsPlaying(false)
    trackActions.videoPause(videoId, title)
    onPause?.()
  }

  const handleEnd = () => {
    setIsPlaying(false)
    trackActions.videoComplete(videoId, title)
    onEnd?.()
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      handlePause()
    } else {
      handlePlay()
    }
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed)
    // YouTube iframe API ile playback rate değiştirme
    // Not: YouTube iframe API playback rate'i desteklemiyor, bu özellik custom player için
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  // YouTube embed URL
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`

  return (
    <div className={`relative group ${className}`}>
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />

        {/* Custom Controls Overlay (for future custom player) */}
        {showControls && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/60 rounded-lg p-4 flex items-center gap-4">
              <button
                onClick={togglePlayPause}
                className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              <select
                value={playbackRate}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="bg-white/20 text-white rounded px-2 py-1 text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Note: YouTube iframe API ile daha gelişmiş kontroller eklenebilir */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Note: Advanced controls (playback speed, chapters) require YouTube Premium or custom player implementation
      </p>
    </div>
  )
}
