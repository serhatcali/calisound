'use client'

import { useState, useEffect } from 'react'
import { SocialPost, SocialPlatform, Campaign } from '@/types/social-media'
import { City } from '@/types/database'
import { validatePostVariant } from '@/lib/social-media-validation'
import { PLATFORM_RULES } from '@/types/social-media'

interface SocialComposerProps {
  initialPost?: SocialPost
  campaigns: Campaign[]
  cities: City[]
}

const PLATFORMS: { value: SocialPlatform; label: string; icon: string }[] = [
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'youtube_shorts', label: 'YouTube Shorts', icon: '📱' },
  { value: 'instagram', label: 'Instagram Feed', icon: '📷' },
  { value: 'instagram_story', label: 'Instagram Story', icon: '📸' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'twitter', label: 'X (Twitter)', icon: '🐦' },
  { value: 'facebook', label: 'Facebook', icon: '👥' }
]

export function SocialComposer({ initialPost, campaigns, cities }: SocialComposerProps) {
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>('youtube')
  const [title, setTitle] = useState(initialPost?.title || '')
  const [baseText, setBaseText] = useState(initialPost?.base_text || '')
  const [selectedCity, setSelectedCity] = useState<number | undefined>(initialPost?.city_id)
  const [selectedCampaign, setSelectedCampaign] = useState<string | undefined>(initialPost?.campaign_id)
  const [saving, setSaving] = useState(false)

  // Platform-specific variant states
  const [variants, setVariants] = useState<Record<SocialPlatform, {
    title?: string
    caption?: string
    description?: string
    hashtags: string[]
    tags?: string
    first_comment?: string
  }>>(() => {
    const defaultVariants: Record<SocialPlatform, any> = {} as any
    PLATFORMS.forEach(p => {
      const existing = initialPost?.variants?.find(v => v.platform === p.value)
      defaultVariants[p.value] = {
        title: existing?.title || '',
        caption: existing?.caption || '',
        description: existing?.description || '',
        hashtags: existing?.hashtags || [],
        tags: existing?.tags || '',
        first_comment: existing?.first_comment || ''
      }
    })
    return defaultVariants
  })

  const currentVariant = variants[activePlatform]
  const rules = PLATFORM_RULES[activePlatform]
  const validation = validatePostVariant(activePlatform, currentVariant)

  const updateVariant = (platform: SocialPlatform, updates: Partial<typeof currentVariant>) => {
    setVariants(prev => ({
      ...prev,
      [platform]: { ...prev[platform], ...updates }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Implement save logic
      alert('Save functionality will be implemented')
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      {/* Base Post Info */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Post Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="e.g., Dubai OUT NOW"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Base Text (English)
          </label>
          <textarea
            value={baseText}
            onChange={(e) => setBaseText(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Enter base text in English..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City (Optional)
            </label>
            <select
              value={selectedCity || ''}
              onChange={(e) => setSelectedCity(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">None</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Campaign (Optional)
            </label>
            <select
              value={selectedCampaign || ''}
              onChange={(e) => setSelectedCampaign(e.target.value || undefined)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">None</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
          {PLATFORMS.map(platform => (
            <button
              key={platform.value}
              onClick={() => setActivePlatform(platform.value)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activePlatform === platform.value
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="mr-2">{platform.icon}</span>
              {platform.label}
            </button>
          ))}
        </div>
      </div>

      {/* Platform-Specific Editor */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {activePlatform.includes('youtube') ? 'Title' : 'Caption'}
            {rules.maxChars && (
              <span className="ml-2 text-xs text-gray-500">
                ({currentVariant.title?.length || currentVariant.caption?.length || 0} / {rules.maxChars})
              </span>
            )}
          </label>
          <input
            type="text"
            value={activePlatform.includes('youtube') ? currentVariant.title || '' : currentVariant.caption || ''}
            onChange={(e) => updateVariant(activePlatform, activePlatform.includes('youtube') 
              ? { title: e.target.value }
              : { caption: e.target.value }
            )}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder={`Enter ${activePlatform.includes('youtube') ? 'title' : 'caption'}...`}
          />
        </div>

        {(activePlatform === 'youtube' || activePlatform === 'youtube_shorts') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
              {rules.maxChars && (
                <span className="ml-2 text-xs text-gray-500">
                  ({currentVariant.description?.length || 0} / {rules.maxChars})
                </span>
              )}
            </label>
            <textarea
              value={currentVariant.description || ''}
              onChange={(e) => updateVariant(activePlatform, { description: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter description..."
            />
          </div>
        )}

        {/* Validation Messages */}
        {validation.errors.length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">Errors:</p>
            <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside">
              {validation.errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {validation.warnings.length > 0 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-1">Warnings:</p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
              {validation.warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !validation.valid}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
          Copy All
        </button>
        <button className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
          Export Pack
        </button>
      </div>
    </div>
  )
}
