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
  const [selectedCity, setSelectedCity] = useState<string | undefined>(initialPost?.city_id)
  const [selectedCampaign, setSelectedCampaign] = useState<string | undefined>(initialPost?.campaign_id)
  const [scheduledAt, setScheduledAt] = useState<string>(
    initialPost?.scheduled_at ? new Date(initialPost.scheduled_at).toISOString().slice(0, 16) : ''
  )
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [copying, setCopying] = useState(false)

  // Platform-specific variant states
  const [variants, setVariants] = useState<Record<SocialPlatform, {
    id?: string
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
        id: existing?.id,
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
  
  // Check if there's any content in variants
  const hasContent = Object.values(variants).some(
    v => v && (v.caption || v.description || v.title)
  )

  const updateVariant = (platform: SocialPlatform, updates: Partial<typeof currentVariant>) => {
    setVariants(prev => ({
      ...prev,
      [platform]: { ...prev[platform], ...updates }
    }))
  }

  const handleSave = async () => {
    if (!title.trim() || !baseText.trim()) {
      alert('Please fill in title and base text')
      return
    }

    setSaving(true)
    try {
      const postData = {
        title: title.trim(),
        base_text: baseText.trim(),
        city_id: selectedCity,
        campaign_id: selectedCampaign,
        timezone: 'Europe/Istanbul',
        scheduled_at: scheduledAt || undefined,
        status: scheduledAt ? 'scheduled' : 'draft',
      }

      let postId = initialPost?.id

      // Create or update post
      if (postId) {
        // Update existing post
        const response = await fetch(`/api/admin/social/posts/${postId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update post')
        }

        const updatedPost = await response.json()
        postId = updatedPost.id
      } else {
        // Create new post
        const response = await fetch('/api/admin/social/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create post')
        }

        const newPost = await response.json()
        postId = newPost.id
      }

      // Save variants
      for (const [platform, variant] of Object.entries(variants)) {
        if (!variant || (!variant.caption && !variant.description && !variant.title)) {
          continue // Skip empty variants
        }

        try {
          if (variant.id) {
            // Update existing variant
            await fetch('/api/admin/social/variants', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: variant.id,
                ...variant,
                post_id: postId,
                platform,
              }),
            })
          } else {
            // Create new variant
            await fetch('/api/admin/social/variants', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...variant,
                post_id: postId,
                platform,
              }),
            })
          }
        } catch (variantError: any) {
          console.error(`Error saving variant for ${platform}:`, variantError)
        }
      }

      alert('Post saved successfully!')
      
      // Redirect to edit page if this was a new post
      if (!initialPost?.id && postId) {
        window.location.href = `/admin/social/compose?id=${postId}`
      }
    } catch (error: any) {
      console.error('Error saving post:', error)
      alert(`Error: ${error.message || 'Failed to save post'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCopyAll = async () => {
    if (!initialPost?.id) {
      alert('Please save the post first before copying')
      return
    }

    setCopying(true)
    try {
      // Get all variants with content
      const variantsWithContent = Object.entries(variants)
        .filter(([_, variant]) => variant && (variant.caption || variant.description || variant.title))
        .map(([platform, variant]) => {
          const platformInfo = PLATFORMS.find(p => p.value === platform)
          let content = ''

          if (platform.includes('youtube')) {
            content = `${variant.title || ''}\n\n${variant.description || ''}`
            if (variant.tags) {
              content += `\n\nTags: ${variant.tags}`
            }
          } else {
            content = variant.caption || ''
            if (variant.hashtags && variant.hashtags.length > 0) {
              content += `\n\n${variant.hashtags.join(' ')}`
            }
            if (variant.first_comment) {
              content += `\n\nFirst Comment: ${variant.first_comment}`
            }
          }

          return {
            platform: platformInfo?.label || platform,
            content: content.trim()
          }
        })

      if (variantsWithContent.length === 0) {
        alert('No content to copy. Please add content for at least one platform.')
        return
      }

      // Format for clipboard
      const clipboardText = variantsWithContent
        .map(v => `=== ${v.platform} ===\n${v.content}\n`)
        .join('\n')

      await navigator.clipboard.writeText(clipboardText)
      alert(`Copied content from ${variantsWithContent.length} platform(s) to clipboard!`)
    } catch (error: any) {
      console.error('Error copying content:', error)
      alert(`Error: ${error.message || 'Failed to copy content'}`)
    } finally {
      setCopying(false)
    }
  }

  const handleExportPack = () => {
    if (!initialPost?.id) {
      alert('Please save the post first before exporting')
      return
    }

    try {
      // Collect all variants with content
      const exportData = {
        post: {
          id: initialPost.id,
          title,
          base_text: baseText,
          city_id: selectedCity,
          campaign_id: selectedCampaign,
          scheduled_at: scheduledAt || null,
        },
        variants: Object.entries(variants)
          .filter(([_, variant]) => variant && (variant.caption || variant.description || variant.title))
          .map(([platform, variant]) => ({
            platform,
            ...variant
          })),
        exported_at: new Date().toISOString(),
        exported_by: 'admin' // TODO: Get from session
      }

      // Create JSON blob
      const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(jsonBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `social-post-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert('Export pack downloaded successfully!')
    } catch (error: any) {
      console.error('Error exporting pack:', error)
      alert(`Error: ${error.message || 'Failed to export pack'}`)
    }
  }

  const handlePublish = async () => {
    if (!initialPost?.id) {
      alert('Please save the post first before publishing')
      return
    }

    if (!hasContent) {
      alert('Please add content for at least one platform before publishing')
      return
    }

    if (!confirm('Publish this post now? This will attempt to publish to all platforms with content.')) {
      return
    }

    setPublishing(true)
    try {
      const response = await fetch(`/api/admin/social/posts/${initialPost.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to publish post')
      }

      const result = await response.json()
      alert(`Publish job started! ${result.message || 'Check the Publishing page for status.'}`)
      
      // Refresh page to show updated status
      window.location.reload()
    } catch (error: any) {
      console.error('Error publishing post:', error)
      alert(`Error: ${error.message || 'Failed to publish post'}`)
    } finally {
      setPublishing(false)
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
              onChange={(e) => setSelectedCity(e.target.value || undefined)}
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

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Schedule Post (Optional)
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Leave empty to save as draft. Timezone: Europe/Istanbul (UTC+3)
          </p>
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
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !validation.valid}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        
        {initialPost?.id && initialPost.status === 'draft' && (
          <button
            onClick={handlePublish}
            disabled={publishing || !hasContent}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Publish this post to all platforms with content"
          >
            {publishing ? 'Publishing...' : 'Publish Now'}
          </button>
        )}

        {initialPost?.id && (
          <>
            <button
              onClick={handleCopyAll}
              disabled={copying}
              className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Copy all platform content to clipboard"
            >
              {copying ? 'Copying...' : 'Copy All'}
            </button>
            <button
              onClick={handleExportPack}
              className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Export post as JSON file"
            >
              Export Pack
            </button>
          </>
        )}
      </div>
    </div>
  )
}
