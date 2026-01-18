'use client'

import { GlobalLinks } from '@/types/database'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LinksAdminFormProps {
  links: GlobalLinks | null
}

export function LinksAdminForm({ links: initialLinks }: LinksAdminFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    youtube: initialLinks?.youtube || '',
    instagram: initialLinks?.instagram || '',
    tiktok: initialLinks?.tiktok || '',
    spotify: initialLinks?.spotify || '',
    apple_music: initialLinks?.apple_music || '',
    soundcloud: initialLinks?.soundcloud || '',
    x: initialLinks?.x || '',
    facebook: initialLinks?.facebook || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Global links updated successfully!')
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update links')
      }
    } catch (error) {
      alert('Error updating links')
    } finally {
      setLoading(false)
    }
  }

  const linkFields = [
    { key: 'youtube', label: 'YouTube', icon: '📺' },
    { key: 'instagram', label: 'Instagram', icon: '📷' },
    { key: 'tiktok', label: 'TikTok', icon: '🎵' },
    { key: 'spotify', label: 'Spotify', icon: '🎧' },
    { key: 'apple_music', label: 'Apple Music', icon: '🍎' },
    { key: 'soundcloud', label: 'SoundCloud', icon: '☁️' },
    { key: 'x', label: 'X (Twitter)', icon: '🐦' },
    { key: 'facebook', label: 'Facebook', icon: '👥' },
  ] as const

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          Global Links Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update global links that appear throughout the site (Homepage, Footer, etc.)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {linkFields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  <span className="mr-2">{field.icon}</span>
                  {field.label}
                </label>
                <input
                  type="url"
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={`https://...`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> These links will be automatically updated across the entire site, including:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1">
            <li>Homepage "Listen Everywhere" section</li>
            <li>Footer social links</li>
            <li>All city pages (if not overridden)</li>
            <li>Navigation and other global components</li>
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Update Global Links'}
          </button>
        </div>
      </form>
    </div>
  )
}
