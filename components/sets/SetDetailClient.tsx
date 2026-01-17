'use client'

import { useState } from 'react'
import { Set } from '@/types/database'
import { motion } from 'framer-motion'
import { SocialShare } from '@/components/shared/SocialShare'

interface SetDetailClientProps {
  set: Set
}

export function SetDetailClient({ set }: SetDetailClientProps) {
  const [copied, setCopied] = useState(false)

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  const videoId = set.youtube_embed ? extractVideoId(set.youtube_embed) : null

  const copyChapters = async () => {
    if (set.chapters) {
      try {
        await navigator.clipboard.writeText(set.chapters)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
  }

  const validateChapters = (chapters: string | null): boolean => {
    if (!chapters) return true
    const lines = chapters.split('\n')
    return lines.every(line => {
      const trimmed = line.trim()
      if (!trimmed) return true
      return /^\d{2}:\d{2}/.test(trimmed)
    })
  }

  const chaptersValid = validateChapters(set.chapters)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-950 rounded-3xl shadow-soft-xl p-8 md:p-12 border border-gray-100 dark:border-gray-900 overflow-hidden"
        >
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 break-words">
            {set.title}
          </h1>

          {set.duration && (
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 font-medium break-words">Duration: {set.duration}</p>
          )}

          {/* Social Share */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Share</h3>
            <SocialShare 
              url={`/sets/${set.id}`}
              title={set.title}
              description={set.description || undefined}
            />
          </div>

          {videoId && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 shadow-soft-xl">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={set.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}

          {set.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line break-words overflow-wrap-anywhere">
                {set.description}
              </p>
            </div>
          )}

          {set.chapters && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4 gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chapters</h2>
                  {!chaptersValid && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Some chapters may not be in the correct format (00:00)
                    </p>
                  )}
                </div>
                <button
                  onClick={copyChapters}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white rounded-lg text-sm font-medium hover:from-orange-400/90 hover:to-amber-400/90 transition-all flex-shrink-0"
                >
                  {copied ? 'Copied!' : 'Copy Chapters'}
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 font-mono bg-white dark:bg-black rounded-xl p-4 overflow-x-auto">
                {set.chapters.split('\n').map((chapter, index) => (
                  <div key={index} className="py-1 break-words overflow-wrap-anywhere">
                    {chapter}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
