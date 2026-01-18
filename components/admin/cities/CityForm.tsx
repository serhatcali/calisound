'use client'

import { City, Region, CityStatus, Mood } from '@/types/database'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface CityFormProps {
  city?: City
}

export function CityForm({ city }: CityFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: city?.name || '',
    slug: city?.slug || '',
    country: city?.country || '',
    country_flag: city?.country_flag || '',
    region: (city?.region || 'Europe') as Region,
    mood: (city?.mood || []) as Mood[],
    status: (city?.status || 'SOON') as CityStatus,
    release_datetime: city?.release_datetime ? new Date(city.release_datetime).toISOString().slice(0, 16) : '',
    cover_square_url: city?.cover_square_url || '',
    banner_16x9_url: city?.banner_16x9_url || '',
    shorts_9x16_url: city?.shorts_9x16_url || '',
    youtube_full: city?.youtube_full || '',
    youtube_shorts: city?.youtube_shorts || '',
    instagram: city?.instagram || '',
    tiktok: city?.tiktok || '',
    spotify: city?.spotify || '',
    apple_music: city?.apple_music || '',
    description_en: city?.description_en || '',
    description_local: city?.description_local || '',
    yt_title: city?.yt_title || '',
    yt_description: city?.yt_description || '',
    yt_tags: city?.yt_tags || '',
    hashtags: city?.hashtags || '',
    isrc: (city as any)?.isrc || '',
  })

  const regions: Region[] = ['Europe', 'MENA', 'Asia', 'Americas']
  const moods: Mood[] = ['festival', 'luxury', 'sunset', 'deep']
  const statuses: CityStatus[] = ['SOON', 'OUT_NOW']

  useEffect(() => {
    // Auto-generate slug from name
    if (!city && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name, city])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = city ? `/api/admin/cities/${city.id}` : '/api/admin/cities'
      const method = city ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          release_datetime: formData.release_datetime || null,
        }),
      })

      if (response.ok) {
        router.push('/admin/cities')
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save city')
      }
    } catch (error) {
      alert('Error saving city')
    } finally {
      setLoading(false)
    }
  }

  const toggleMood = (mood: Mood) => {
    setFormData(prev => ({
      ...prev,
      mood: prev.mood.includes(mood)
        ? prev.mood.filter(m => m !== mood)
        : [...prev.mood, mood],
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          {city ? 'Edit City' : 'New City'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {city ? `Editing ${city.name}` : 'Create a new city entry'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  City Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  Country Flag (Emoji)
                </label>
                <input
                  type="text"
                  value={formData.country_flag}
                  onChange={(e) => setFormData(prev => ({ ...prev, country_flag: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="🇺🇸"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  Region *
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value as Region }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as CityStatus }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'OUT_NOW' ? 'OUT NOW' : status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  Release Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.release_datetime}
                  onChange={(e) => setFormData(prev => ({ ...prev, release_datetime: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  ISRC Code
                </label>
                <input
                  type="text"
                  value={formData.isrc}
                  onChange={(e) => setFormData(prev => ({ ...prev, isrc: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="USRC17607839"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                Moods *
              </label>
              <div className="flex flex-wrap gap-2">
                {moods.map(mood => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      formData.mood.includes(mood)
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-900 text-white dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Media URLs */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Media URLs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  Cover Square URL
                </label>
                <input
                  type="url"
                  value={formData.cover_square_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, cover_square_url: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  Banner 16:9 URL
                </label>
                <input
                  type="url"
                  value={formData.banner_16x9_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, banner_16x9_url: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  Shorts 9:16 URL
                </label>
                <input
                  type="url"
                  value={formData.shorts_9x16_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, shorts_9x16_url: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  YouTube Full
                </label>
                <input
                  type="url"
                  value={formData.youtube_full}
                  onChange={(e) => setFormData(prev => ({ ...prev, youtube_full: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  YouTube Shorts
                </label>
                <input
                  type="url"
                  value={formData.youtube_shorts}
                  onChange={(e) => setFormData(prev => ({ ...prev, youtube_shorts: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  TikTok
                </label>
                <input
                  type="url"
                  value={formData.tiktok}
                  onChange={(e) => setFormData(prev => ({ ...prev, tiktok: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  Spotify
                </label>
                <input
                  type="url"
                  value={formData.spotify}
                  onChange={(e) => setFormData(prev => ({ ...prev, spotify: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  Apple Music
                </label>
                <input
                  type="url"
                  value={formData.apple_music}
                  onChange={(e) => setFormData(prev => ({ ...prev, apple_music: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Descriptions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  Description (English)
                </label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  Description (Local Language)
                </label>
                <textarea
                  value={formData.description_local}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_local: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* YouTube Metadata */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">YouTube Metadata</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  YouTube Title
                </label>
                <input
                  type="text"
                  value={formData.yt_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, yt_title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  YouTube Description
                </label>
                <textarea
                  value={formData.yt_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, yt_description: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  YouTube Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.yt_tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, yt_tags: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="afrohouse, dj, calisound"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  Hashtags
                </label>
                <input
                  type="text"
                  value={formData.hashtags}
                  onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="#calisound #afrohouse"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : city ? 'Update City' : 'Create City'}
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
