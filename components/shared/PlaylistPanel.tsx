'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getPlaylist, clearPlaylist, PlaylistItem } from '@/lib/playlist'
import { motion, AnimatePresence } from 'framer-motion'

export function PlaylistPanel() {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const updatePlaylist = () => {
      setPlaylist(getPlaylist())
    }
    
    updatePlaylist()
    window.addEventListener('playlist-changed', updatePlaylist)
    return () => window.removeEventListener('playlist-changed', updatePlaylist)
  }, [])

  if (playlist.length === 0) return null

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:from-orange-600 hover:to-amber-600 transition-all"
        aria-label="Open playlist"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        {playlist.length > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {playlist.length}
          </span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-gray-900/50 z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-black z-50 shadow-2xl overflow-hidden"
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Playlist</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{playlist.length} items</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {playlist.length > 0 && (
                      <button
                        onClick={clearPlaylist}
                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {playlist.map((item, index) => (
                    <motion.div
                      key={`${item.type}-${item.id}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.url}
                        onClick={() => setIsOpen(false)}
                        className="block p-3 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {item.type}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                {playlist.length > 0 && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => {
                        // Play all - open first item
                        if (playlist[0]) {
                          window.open(playlist[0].url, '_blank')
                        }
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
                    >
                      Play All
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
