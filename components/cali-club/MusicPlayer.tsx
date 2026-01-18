'use client'

import { useEffect, useRef, useState } from 'react'
import { useCaliClubStore } from '@/stores/cali-club-store'
import { PlayIcon, PauseIcon } from './Icons'

interface MusicPlayerProps {
  videoId: string
  isPlaying: boolean
  onStateChange?: (isPlaying: boolean) => void
}

export function MusicPlayer({ videoId, isPlaying, onStateChange }: MusicPlayerProps) {
  const { currentSong } = useCaliClubStore()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const progressRef = useRef<HTMLDivElement>(null)
  const volumeRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get reference to global YouTube player
  const getYouTubePlayer = () => {
    const player = (window as any).globalYouTubePlayer
    if (!player) {
      // Try to get from global variable
      const container = document.getElementById('youtube-player-container')
      if (container) {
        const inner = container.querySelector('.youtube-player-inner')
        if (inner && (inner as any).player) {
          return (inner as any).player
        }
      }
    }
    return player
  }

  // Set duration from currentSong (from store, not from player)
  useEffect(() => {
    if (currentSong?.duration && typeof currentSong.duration === 'number' && currentSong.duration > 0) {
      setDuration(currentSong.duration)
    } else {
      setDuration(0)
    }
  }, [currentSong])

  // Update current time only (duration comes from store)
  useEffect(() => {
    const updateTime = () => {
      const player = getYouTubePlayer()
      if (player) {
        try {
          // Only get current time, not duration (duration comes from store)
          if (typeof player.getCurrentTime !== 'function') {
            return
          }
          
          const current = player.getCurrentTime()
          
          if (current !== undefined && !isNaN(current) && typeof current === 'number') {
            setCurrentTime(current)
          }
        } catch (e) {
          // Player not ready yet or method not available
          console.debug('[MusicPlayer] Player not ready:', e)
        }
      }
    }

    // Update immediately
    updateTime()

    // Update every 100ms when playing
    if (isPlaying) {
      intervalRef.current = setInterval(updateTime, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying, videoId])

  // Format time
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle play/pause
  const handlePlayPause = () => {
    if (!videoId) return
    const player = getYouTubePlayer()
    if (!player) return
    
    // Check if player methods are available
    if (typeof player.playVideo !== 'function' || typeof player.pauseVideo !== 'function') {
      return
    }
    
    try {
      if (isPlaying) {
        player.pauseVideo()
        onStateChange?.(false)
      } else {
        player.playVideo()
        onStateChange?.(true)
      }
    } catch (e) {
      console.error('Error toggling play/pause:', e)
    }
  }

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoId || !progressRef.current || !duration) return
    const player = getYouTubePlayer()
    if (!player || typeof player.seekTo !== 'function') return

    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration

    try {
      player.seekTo(newTime, true)
      setCurrentTime(newTime)
    } catch (e) {
      console.error('Error seeking:', e)
    }
  }

  // Handle volume change
  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoId || !volumeRef.current) return
    const player = getYouTubePlayer()
    if (!player || typeof player.setVolume !== 'function') return

    const rect = volumeRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newVolume = Math.max(0, Math.min(100, percent * 100))

    try {
      player.setVolume(newVolume)
      setVolume(newVolume)
    } catch (e) {
      console.error('Error setting volume:', e)
    }
  }

  // Get volume from player
  useEffect(() => {
    const player = getYouTubePlayer()
    if (player && typeof player.getVolume === 'function') {
      try {
        const vol = player.getVolume()
        if (vol !== undefined && !isNaN(vol) && typeof vol === 'number') {
          setVolume(vol)
        }
      } catch (e) {
        // Player not ready
        console.debug('[MusicPlayer] Could not get volume:', e)
      }
    }
  }, [videoId])

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const hasSong = currentSong && videoId

  return (
    <div className="relative z-[1000] bg-gradient-to-t from-black via-black to-gray-950 border-t-2 border-yellow-500/30 backdrop-blur-2xl shadow-[0_-10px_50px_rgba(234,179,8,0.2)] pointer-events-auto flex-shrink-0 h-[100px] w-full">
      <div className="w-full px-4 py-3">
        {/* Song Info */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 min-w-0">
            {hasSong ? (
              <>
                <div className="text-yellow-400 font-bold text-sm truncate">{currentSong?.title || 'Unknown'}</div>
                <div className="text-gray-400 text-xs truncate">{currentSong?.artist || 'Unknown Artist'}</div>
              </>
            ) : (
              <>
                <div className="text-gray-500 font-bold text-sm">No song selected</div>
                <div className="text-gray-600 text-xs">Select a song to play</div>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            disabled={!hasSong}
            className={`w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500/30 to-amber-500/30 border border-yellow-500/50 flex items-center justify-center transition-all shadow-lg hover:shadow-xl ${
              hasSong
                ? 'hover:from-yellow-500/40 hover:to-amber-500/40 hover:border-yellow-500/70 cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <PauseIcon className="text-yellow-400" size={18} />
            ) : (
              <PlayIcon className="text-yellow-400" size={18} />
            )}
          </button>

          {/* Progress Bar */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
            <div
              ref={progressRef}
              onClick={hasSong ? handleProgressClick : undefined}
              className={`flex-1 h-1.5 bg-gray-800 rounded-full relative group ${
                hasSong ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
            >
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
              {hasSong && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2"
                  style={{ left: `${progressPercent}%` }}
                />
              )}
            </div>
            <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 w-24">
            <div
              ref={volumeRef}
              onClick={hasSong ? handleVolumeClick : undefined}
              className={`flex-1 h-1.5 bg-gray-800 rounded-full relative group ${
                hasSong ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
            >
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all"
                style={{ width: `${volume}%` }}
              />
              {hasSong && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2"
                  style={{ left: `${volume}%` }}
                />
              )}
            </div>
            <span className="text-xs text-gray-400 w-8 text-right">{Math.round(volume)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
