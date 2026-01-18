'use client'

import { motion } from 'framer-motion'

export function SongSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-black/60 border-2 border-gray-800 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gray-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-800 rounded w-3/4" />
          <div className="h-3 bg-gray-800 rounded w-1/2" />
          <div className="h-3 bg-gray-800 rounded w-1/4" />
        </div>
      </div>
    </div>
  )
}

export function SongListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <SongSkeleton />
        </motion.div>
      ))}
    </div>
  )
}

export function MessageSkeleton() {
  return (
    <div className="bg-black/60 rounded-xl p-4 border-2 border-gray-800 animate-pulse">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-5 bg-gray-800 rounded w-20" />
        <div className="h-3 bg-gray-800 rounded w-16" />
      </div>
      <div className="h-4 bg-gray-800 rounded w-full" />
    </div>
  )
}
