'use client'

import { Set } from '@/types/database'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SetFormProps {
  set?: Set
}

export function SetForm({ set }: SetFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: set?.title || '',
    youtube_embed: set?.youtube_embed || '',
    duration: set?.duration || '',
    description: set?.description || '',
    chapters: set?.chapters || '',
    thumbnail_url: (set as any)?.thumbnail_url || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = set ? `/api/admin/sets/${set.id}` : '/api/admin/sets'
      const method = set ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/sets')
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save set')
      }
    } catch (error) {
      alert('Error saving set')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          {set ? 'Edit Set' : 'New Set'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {set ? `Editing ${set.title}` : 'Create a new DJ set entry'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
              YouTube Embed URL *
            </label>
            <input
              type="url"
              value={formData.youtube_embed}
              onChange={(e) => setFormData(prev => ({ ...prev, youtube_embed: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="1:30:00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                Thumbnail URL
              </label>
              <input
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={6}
              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
              Chapters (one per line, format: 00:00 - Track Name)
            </label>
            <textarea
              value={formData.chapters}
              onChange={(e) => setFormData(prev => ({ ...prev, chapters: e.target.value }))}
              rows={10}
              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
              placeholder="00:00 - Intro&#10;05:30 - Track 1&#10;12:45 - Track 2"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : set ? 'Update Set' : 'Create Set'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-white dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
