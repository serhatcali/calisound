'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

const TIMEZONES = [
  'Europe/Istanbul',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Dubai',
  'Australia/Sydney',
]

export function NewTemplateForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_city: '',
    default_country: '',
    default_local_language: 'English',
    default_local_language_code: 'en',
    default_include_english: true,
    default_timezone: 'Europe/Istanbul',
    default_fast_mode: false,
    default_platforms: ['youtube', 'instagram_reels', 'tiktok', 'twitter'] as ReleasePlatform[],
    tags: [] as string[],
    is_public: false,
  })
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create template')
      }

      const template = await response.json()
      alert('Template created successfully!')
      router.push('/admin/templates')
    } catch (error: any) {
      alert(`Error: ${error.message || 'Failed to create template'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (language: string) => {
    setFormData({
      ...formData,
      default_local_language: language,
      default_local_language_code: LANGUAGE_CODES[language] || 'en',
    })
  }

  const togglePlatform = (platform: ReleasePlatform) => {
    setFormData({
      ...formData,
      default_platforms: formData.default_platforms.includes(platform)
        ? formData.default_platforms.filter(p => p !== platform)
        : [...formData.default_platforms, platform],
    })
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
      })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-black text-white">
            New Template
          </h1>
          <Link
            href="/admin/templates"
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            ← Back to Templates
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Create a reusable template for faster release planning
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Template Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Summer Festival Release"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
              placeholder="Optional description of this template..."
            />
          </div>
        </div>

        {/* Default Location */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Default Location</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.default_city}
                onChange={(e) => setFormData({ ...formData, default_city: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Paris"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.default_country}
                onChange={(e) => setFormData({ ...formData, default_country: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., France"
              />
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Language Settings</h2>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Local Language
            </label>
            <select
              value={formData.default_local_language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {Object.keys(LANGUAGE_CODES).map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="include_english"
              checked={formData.default_include_english}
              onChange={(e) => setFormData({ ...formData, default_include_english: e.target.checked })}
              className="w-4 h-4 text-orange-600 bg-gray-900 border-gray-800 rounded focus:ring-orange-500"
            />
            <label htmlFor="include_english" className="text-white">
              Include English in descriptions
            </label>
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Timezone</h2>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Default Timezone
            </label>
            <select
              value={formData.default_timezone}
              onChange={(e) => setFormData({ ...formData, default_timezone: e.target.value })}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Platform Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Default Platforms</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PLATFORMS.map(platform => (
              <label
                key={platform}
                className="flex items-center gap-2 p-3 bg-gray-900 border border-gray-800 rounded-lg cursor-pointer hover:border-orange-500 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.default_platforms.includes(platform)}
                  onChange={() => togglePlatform(platform)}
                  className="w-4 h-4 text-orange-600 bg-gray-900 border-gray-800 rounded focus:ring-orange-500"
                />
                <span className="text-white text-sm">{PLATFORM_LABELS[platform]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Tags</h2>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Add a tag and press Enter"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Add
            </button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-orange-400 hover:text-orange-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Options</h2>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="fast_mode"
              checked={formData.default_fast_mode}
              onChange={(e) => setFormData({ ...formData, default_fast_mode: e.target.checked })}
              className="w-4 h-4 text-orange-600 bg-gray-900 border-gray-800 rounded focus:ring-orange-500"
            />
            <label htmlFor="fast_mode" className="text-white">
              Default to Fast Mode (T-3 to T+3 instead of T-7 to T+3)
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="w-4 h-4 text-orange-600 bg-gray-900 border-gray-800 rounded focus:ring-orange-500"
            />
            <label htmlFor="is_public" className="text-white">
              Make this template public (available to all users)
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Template'}
          </button>
          <Link
            href="/admin/templates"
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
