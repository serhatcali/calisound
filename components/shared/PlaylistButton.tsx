'use client'

import { useState, useEffect } from 'react'
import { addToPlaylist, removeFromPlaylist, isInPlaylist, PlaylistItem } from '@/lib/playlist'

interface PlaylistButtonProps {
  id: string
  type: 'city' | 'set'
  name: string
  url: string
  image?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PlaylistButton({ id, type, name, url, image, size = 'md' }: PlaylistButtonProps) {
  const [inPlaylist, setInPlaylist] = useState(false)

  useEffect(() => {
    setInPlaylist(isInPlaylist(id, type))
    
    const handleChange = () => {
      setInPlaylist(isInPlaylist(id, type))
    }
    
    window.addEventListener('playlist-changed', handleChange)
    return () => window.removeEventListener('playlist-changed', handleChange)
  }, [id, type])

  const handleClick = () => {
    if (inPlaylist) {
      removeFromPlaylist(id, type)
    } else {
      const item: PlaylistItem = {
        id,
        type,
        name,
        url,
        image,
        addedAt: new Date().toISOString(),
      }
      addToPlaylist(item)
    }
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20 transition-all ${
        inPlaylist ? 'bg-orange-500/30 border-orange-400' : ''
      }`}
      title={inPlaylist ? 'Remove from playlist' : 'Add to playlist'}
      aria-label={inPlaylist ? 'Remove from playlist' : 'Add to playlist'}
    >
      {inPlaylist ? (
        <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )}
    </button>
  )
}
