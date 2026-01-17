'use client'

import { useState } from 'react'
import { City } from '@/types/database'
import { motion } from 'framer-motion'

interface CopyToolsProps {
  city: City
}

export function CopyTools({ city }: CopyToolsProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const validateTags = (tags: string | null): { valid: boolean; length: number; maxLength: number } => {
    if (!tags) return { valid: true, length: 0, maxLength: 500 }
    const length = tags.length
    return { valid: length <= 500, length, maxLength: 500 }
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

  const tagValidation = validateTags(city.yt_tags)

  return (
    <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl p-8 border border-gray-100 dark:border-gray-900">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Copy Tools</h2>
      
      <div className="space-y-4">
        {/* YouTube Title */}
        {city.yt_title && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between mb-3 gap-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex-shrink-0">YouTube Title</h3>
              <button
                onClick={() => copyToClipboard(city.yt_title!, 'title')}
                className="px-4 py-2 bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white rounded-lg text-sm font-medium hover:from-orange-400/90 hover:to-amber-400/90 transition-all flex-shrink-0"
              >
                {copied === 'title' ? 'Copied!' : 'Copy'}
              </button>
            </div>
              <p className="text-gray-700 dark:text-gray-300 break-words overflow-wrap-anywhere">{city.yt_title}</p>
          </div>
        )}

        {/* YouTube Description */}
        {city.yt_description && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between mb-3 gap-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex-shrink-0">YouTube Description</h3>
              <button
                onClick={() => copyToClipboard(city.yt_description!, 'description')}
                className="px-4 py-2 bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white rounded-lg text-sm font-medium hover:from-orange-400/90 hover:to-amber-400/90 transition-all flex-shrink-0"
              >
                {copied === 'description' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm break-words overflow-wrap-anywhere max-w-full">{city.yt_description}</p>
          </div>
        )}

        {/* YouTube Tags */}
        {city.yt_tags && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between mb-3 gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">YouTube Tags</h3>
                <p className={`text-xs mt-1 ${
                  tagValidation.valid ? 'text-gray-500 dark:text-gray-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {tagValidation.length} / {tagValidation.maxLength} characters
                  {!tagValidation.valid && ' (Exceeds limit!)'}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(city.yt_tags!, 'tags')}
                className="px-4 py-2 bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white rounded-lg text-sm font-medium hover:from-orange-400/90 hover:to-amber-400/90 transition-all flex-shrink-0"
              >
                {copied === 'tags' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm break-words overflow-wrap-anywhere max-w-full">{city.yt_tags}</p>
          </div>
        )}

        {/* Hashtags */}
        {city.hashtags && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between mb-3 gap-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex-shrink-0">Hashtags</h3>
              <button
                onClick={() => copyToClipboard(city.hashtags!, 'hashtags')}
                className="px-4 py-2 bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white rounded-lg text-sm font-medium hover:from-orange-400/90 hover:to-amber-400/90 transition-all flex-shrink-0"
              >
                {copied === 'hashtags' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm break-words overflow-wrap-anywhere max-w-full">{city.hashtags}</p>
          </div>
        )}
      </div>
    </div>
  )
}
