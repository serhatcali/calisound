'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Set } from '@/types/database'
import { motion } from 'framer-motion'

interface SetsPageClientProps {
  sets: Set[]
}

export function SetsPageClient({ sets }: SetsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSets = useMemo(() => {
    if (!searchQuery.trim()) return sets
    
    const query = searchQuery.toLowerCase()
    return sets.filter((set) => {
      return (
        set.title.toLowerCase().includes(query) ||
        (set.description && set.description.toLowerCase().includes(query))
      )
    })
  }, [sets, searchQuery])

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
            DJ Sets
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
            Immersive Afro House mixes and sets
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sets by title or description..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all shadow-soft"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </motion.div>

        {/* Results Count */}
        {searchQuery && (
          <div className="mb-6 text-gray-600 dark:text-gray-400 font-medium text-center">
            Found {filteredSets.length} of {sets.length} sets
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set, index) => {
            const videoId = set.youtube_embed ? extractVideoId(set.youtube_embed) : null

            return (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link href={`/sets/${set.id}`}>
                  <div className="group bg-white dark:bg-black rounded-2xl shadow-soft overflow-hidden hover:shadow-soft-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-900">
                    {/* Video Preview */}
                    {videoId && (
                      <div className="relative aspect-video overflow-hidden bg-gray-900">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=0&showinfo=0`}
                          title={set.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-white/80 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                            <svg
                              className="w-8 h-8 text-gray-900 ml-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                        {set.title}
                      </h3>
                      {set.duration && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm font-medium">
                          Duration: {set.duration}
                        </p>
                      )}
                      {set.description && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                          {set.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {filteredSets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery ? 'No sets found matching your search.' : 'No sets available yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
