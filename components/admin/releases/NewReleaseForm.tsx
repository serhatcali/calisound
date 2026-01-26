'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ReleasePlatform } from '@/types/release-planning'
import { PLATFORM_LABELS } from '@/types/release-planning'

const PLATFORMS: ReleasePlatform[] = [
  'youtube',
  'youtube_shorts',
  'instagram_reels',
  'instagram_story',
  'tiktok',
  'tiktok_story',
  'twitter',
  'soundcloud',
]

const LANGUAGE_CODES: Record<string, string> = {
  'English': 'en',
  'Turkish': 'tr',
  'Spanish': 'es',
  'French': 'fr',
  'German': 'de',
  'Italian': 'it',
  'Portuguese': 'pt',
  'Arabic': 'ar',
  'Russian': 'ru',
  'Japanese': 'ja',
  'Korean': 'ko',
  'Chinese': 'zh',
}

export function NewReleaseForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    song_title: '',
    city: '',
    country: '',
    local_language: 'English',
    local_language_code: 'en',
    include_english: false,
    release_at: '',
    timezone: 'Europe/Istanbul',
    platforms: [] as ReleasePlatform[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Convert local datetime to ISO string
      const releaseDateTime = new Date(`${formData.release_at}:00`)
      const releaseAtISO = releaseDateTime.toISOString()

      const response = await fetch('/api/admin/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          release_at: releaseAtISO,
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to create release'
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch {
          // If response is not JSON, try to get text
          const text = await response.text()
          if (text) {
            errorMessage = `Server error: ${response.status}`
          }
        }
        throw new Error(errorMessage)
      }

      let release
      try {
        release = await response.json()
      } catch (error) {
        throw new Error('Invalid response from server')
      }

      alert('Release created successfully! Timeline and platform plans are being generated in the background.')
      router.push(`/admin/releases/${release.id}`)
    } catch (error: any) {
      console.error('Error creating release:', error)
      alert(`Error: ${error.message || 'Failed to create release'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (language: string) => {
    setFormData({
      ...formData,
      local_language: language,
      local_language_code: LANGUAGE_CODES[language] || 'en',
    })
  }

  const togglePlatform = (platform: ReleasePlatform) => {
    setFormData({
      ...formData,
      platforms: formData.platforms.includes(platform)
        ? formData.platforms.filter(p => p !== platform)
        : [...formData.platforms, platform],
    })
  }

  // Calculate if fast mode
  const releaseDate = formData.release_at ? new Date(`${formData.release_at}:00`) : null
  const now = new Date()
  const daysUntilRelease = releaseDate
    ? Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null
  const isFastMode = daysUntilRelease !== null && daysUntilRelease < 7

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          New Release
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new song release with AI-assisted planning
        </p>
      </div>

      {isFastMode && (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-400 font-medium">
            ⚡ Release date is less than 7 days away. Fast promotion mode (T-3 to T+3) will be activated.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
        {/* Song Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Song Title *
          </label>
          <input
            type="text"
            required
            value={formData.song_title}
            onChange={(e) => setFormData({ ...formData, song_title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="e.g., City Vibes"
          />
        </div>

        {/* City & Country */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="e.g., Dubai"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="e.g., UAE"
            />
          </div>
        </div>

        {/* Language */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Local Language *
            </label>
            <select
              required
              value={formData.local_language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {Object.keys(LANGUAGE_CODES).map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Include English Copy
            </label>
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={formData.include_english}
                onChange={(e) => setFormData({ ...formData, include_english: e.target.checked })}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Generate English copy in addition to local language
              </span>
            </label>
          </div>
        </div>

        {/* Release Date & Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Release Date & Time (Europe/Istanbul - UTC+3) *
          </label>
          <input
            type="datetime-local"
            required
            value={formData.release_at}
            onChange={(e) => setFormData({ ...formData, release_at: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Timezone: {formData.timezone}
          </p>
        </div>

        {/* Platforms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Platforms *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PLATFORMS.map(platform => (
              <label
                key={platform}
                className="flex items-center p-3 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.platforms.includes(platform)}
                  onChange={() => togglePlatform(platform)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {PLATFORM_LABELS[platform]}
                </span>
              </label>
            ))}
          </div>
          {formData.platforms.length === 0 && (
            <p className="text-xs text-red-500 mt-1">Please select at least one platform</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || formData.platforms.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Creating...' : 'Create Release'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
