'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { isFavorite, toggleFavorite } from '@/lib/favorites'

interface FavoriteButtonProps {
  cityId: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FavoriteButton({ cityId, size = 'md', className = '' }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setFavorited(isFavorite(cityId))
  }, [cityId])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!mounted) return
    
    try {
      const newState = toggleFavorite(cityId)
      setFavorited(newState)
      
      // Trigger custom event for other components to listen
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('favorites-changed', { detail: { cityId, favorited: newState } }))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  if (!mounted) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse ${className}`} />
    )
  }

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-colors cursor-pointer ${
        favorited
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
      } shadow-md hover:shadow-lg ${className}`}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <motion.svg
        className={iconSizes[size]}
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
        initial={false}
        animate={{ scale: favorited ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </motion.svg>
    </motion.button>
  )
}
