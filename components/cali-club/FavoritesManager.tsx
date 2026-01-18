'use client'

import { useState, useEffect } from 'react'
import { HeartIcon } from './Icons'
import { showToast } from './Toast'

interface FavoritesManagerProps {
  songId: string
  className?: string
}

export function FavoritesManager({ songId, className = '' }: FavoritesManagerProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('cali_club_favorites') || '[]')
    setIsFavorite(favorites.includes(songId))
  }, [songId])

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('cali_club_favorites') || '[]')
    
    if (isFavorite) {
      const newFavorites = favorites.filter((id: string) => id !== songId)
      localStorage.setItem('cali_club_favorites', JSON.stringify(newFavorites))
      setIsFavorite(false)
      showToast('Removed from favorites', 'info')
    } else {
      favorites.push(songId)
      localStorage.setItem('cali_club_favorites', JSON.stringify(favorites))
      setIsFavorite(true)
      showToast('Added to favorites', 'success')
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      className={`p-2 rounded-lg transition-all ${
        isFavorite
          ? 'text-red-500 hover:bg-red-500/20'
          : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
      } ${className}`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <HeartIcon size={18} className={isFavorite ? 'fill-current' : ''} />
    </button>
  )
}
