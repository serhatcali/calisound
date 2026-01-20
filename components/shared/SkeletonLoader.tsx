'use client'

import { motion } from 'framer-motion'

interface SkeletonLoaderProps {
  className?: string
  variant?: 'card' | 'text' | 'image' | 'grid'
  count?: number
}

export function SkeletonLoader({ className = '', variant = 'card', count = 1 }: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-800 rounded'
  
  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="relative aspect-square rounded-3xl overflow-hidden"
          >
            <div className={`absolute inset-0 ${baseClasses}`} />
            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
              <div className={`h-6 w-32 ${baseClasses}`} />
              <div className={`h-4 w-24 ${baseClasses}`} />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }
  
  if (variant === 'image') {
    return (
      <div className={`relative aspect-square ${className}`}>
        <div className={`absolute inset-0 ${baseClasses}`} />
      </div>
    )
  }
  
  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`h-4 ${baseClasses}`} style={{ width: `${100 - i * 10}%` }} />
        ))}
      </div>
    )
  }
  
  // Default card variant
  return (
    <div className={`relative aspect-square rounded-2xl overflow-hidden ${className}`}>
      <div className={`absolute inset-0 ${baseClasses}`} />
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
        <div className={`h-5 w-24 ${baseClasses}`} />
        <div className={`h-4 w-16 ${baseClasses}`} />
      </div>
    </div>
  )
}
