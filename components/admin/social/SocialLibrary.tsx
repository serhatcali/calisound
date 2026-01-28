'use client'

import { useState, useEffect } from 'react'
import { SocialAsset, SocialTemplate, SocialPlatform, SocialHashtagSet, SocialTagPack } from '@/types/social-media'
import { format } from 'date-fns'
import { getSupabase } from '@/lib/supabase'

const PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'youtube_shorts', label: 'YouTube Shorts' },
  { value: 'instagram', label: 'Instagram Feed' },
  { value: 'instagram_story', label: 'Instagram Story' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'twitter', label: 'X (Twitter)' },
  { value: 'facebook', label: 'Facebook' },
]

export function SocialLibrary() {
  const [activeTab, setActiveTab] = useState<'assets' | 'templates' | 'hashtags' | 'tags'>('assets')
  const [assets, setAssets] = useState<SocialAsset[]>([])
  const [templates, setTemplates] = useState<SocialTemplate[]>([])
  const [hashtagSets, setHashtagSets] = useState<SocialHashtagSet[]>([])
  const [tagPacks, setTagPacks] = useState<SocialTagPack[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Asset filters
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all')
  const [assetAspectFilter, setAssetAspectFilter] = useState<string>('all')

  // Template filters
  const [templatePlatformFilter, setTemplatePlatformFilter] = useState<string>('all')

  // Hashtag filters
  const [hashtagPlatformFilter, setHashtagPlatformFilter] = useState<string>('all')

  // Template form
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<SocialTemplate | null>(null)
  const [templateForm, setTemplateForm] = useState({
    platform: 'youtube' as SocialPlatform,
    name: '',
    text_template: '',
    hashtag_template: '',
    tag_template: '',
  })

  // Hashtag form
  const [showHashtagForm, setShowHashtagForm] = useState(false)
  const [editingHashtagSet, setEditingHashtagSet] = useState<SocialHashtagSet | null>(null)
  const [hashtagForm, setHashtagForm] = useState({
    platform: 'instagram' as SocialPlatform,
    name: '',
    hashtags: [] as string[],
    hashtagInput: '', // For text input
    description: '',
  })

  // Tag pack form
  const [showTagPackForm, setShowTagPackForm] = useState(false)
  const [editingTagPack, setEditingTagPack] = useState<SocialTagPack | null>(null)
  const [tagPackForm, setTagPackForm] = useState({
    name: '',
    tags: '',
    description: '',
  })

  useEffect(() => {
    loadData()
    checkStorage()
  }, [])

  useEffect(() => {
    if (activeTab === 'hashtags') {
      loadHashtagSets()
    } else if (activeTab === 'tags') {
      loadTagPacks()
    }
  }, [activeTab])

  const checkStorage = async () => {
    try {
      const response = await fetch('/api/admin/social/storage/check')
      const data = await response.json()
      if (!data.exists) {
        console.warn('Storage bucket check:', data)
      }
    } catch (error) {
      console.error('Error checking storage:', error)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [assetsRes, templatesRes] = await Promise.all([
        fetch('/api/admin/social/assets'),
        fetch('/api/admin/social/templates'),
      ])

      if (assetsRes.ok) {
        const assetsData = await assetsRes.json()
        setAssets(assetsData)
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json()
        setTemplates(templatesData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHashtagSets = async () => {
    try {
      const platform = hashtagPlatformFilter !== 'all' ? hashtagPlatformFilter : undefined
      const url = platform 
        ? `/api/admin/social/hashtags?platform=${platform}`
        : '/api/admin/social/hashtags'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setHashtagSets(data)
      }
    } catch (error) {
      console.error('Error loading hashtag sets:', error)
    }
  }

  const loadTagPacks = async () => {
    try {
      const response = await fetch('/api/admin/social/tagpacks')
      if (response.ok) {
        const data = await response.json()
        setTagPacks(data)
      }
    } catch (error) {
      console.error('Error loading tag packs:', error)
    }
  }

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    if (!isImage && !isVideo) {
      alert('Please upload an image or video file')
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB')
      return
    }

    setUploading(true)

    try {
      // First check if bucket is accessible (client-side check)
      try {
        const supabase = getSupabase()
        const { data: listData, error: listError } = await supabase.storage
          .from('calisound')
          .list('', { limit: 1 })
        
        if (listError) {
          console.error('Bucket check error:', listError)
          if (listError.message?.includes('Bucket not found') || listError.message?.includes('not found')) {
            throw new Error('Storage bucket "media" not found. Please create it in Supabase Dashboard > Storage > Create Bucket. Make it public for asset access.')
          }
          throw new Error(`Storage bucket error: ${listError.message}`)
        }
      } catch (checkError: any) {
        if (checkError.message?.includes('Bucket not found')) {
          throw checkError
        }
        console.warn('Bucket check warning:', checkError)
        // Continue anyway, might be a permission issue but upload might work
      }

      // Upload to Supabase Storage
      const supabase = getSupabase()
      const fileExt = file.name.split('.').pop()
      const fileName = `social-assets/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('calisound')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          throw new Error('Storage bucket "media" not found. Please verify:\n1. Bucket name is exactly "media" (lowercase)\n2. Bucket is set to Public in Supabase Dashboard\n3. Your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct')
        }
        if (uploadError.message?.includes('new row violates row-level security') || uploadError.message?.includes('RLS')) {
          throw new Error('Storage bucket RLS policy error. Please create policies via Supabase Dashboard:\n\n1. Go to Storage > Policies\n2. Select "calisound" bucket\n3. Create 4 policies (SELECT, INSERT, UPDATE, DELETE)\n4. Policy Definition: bucket_id = \'calisound\'\n\nSee STORAGE_POLICY_SETUP.md for detailed instructions.')
        }
        throw new Error(`Upload failed: ${uploadError.message || 'Unknown error'}`)
      }

      // Get image dimensions if it's an image
      let width: number | undefined
      let height: number | undefined
      let aspectRatio: string | undefined

      if (isImage) {
        const img = new Image()
        const objectUrl = URL.createObjectURL(file)
        await new Promise((resolve, reject) => {
          img.onload = () => {
            width = img.width
            height = img.height
            const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
            const divisor = gcd(width!, height!)
            aspectRatio = `${width! / divisor}:${height! / divisor}`
            URL.revokeObjectURL(objectUrl)
            resolve(null)
          }
          img.onerror = reject
          img.src = objectUrl
        })
      }

      // Create asset record
      const response = await fetch('/api/admin/social/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storage_path: fileName,
          type: isImage ? 'image' : 'video',
          width,
          height,
          aspect_ratio: aspectRatio,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create asset record')
      }

      alert('Asset uploaded successfully!')
      await loadData()
    } catch (error: any) {
      console.error('Error uploading asset:', error)
      const errorMessage = error.message || 'Failed to upload asset'
      if (errorMessage.includes('Bucket not found')) {
        alert(`Error: ${errorMessage}\n\nPlease create a "media" bucket in Supabase Dashboard:\n1. Go to Storage\n2. Click "Create Bucket"\n3. Name it "media"\n4. Make it public\n5. Try uploading again`)
      } else {
        alert(`Error: ${errorMessage}`)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Delete this asset?')) return

    try {
      const response = await fetch(`/api/admin/social/assets/${assetId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete asset')
      }

      alert('Asset deleted successfully!')
      await loadData()
    } catch (error: any) {
      console.error('Error deleting asset:', error)
      alert(`Error: ${error.message || 'Failed to delete asset'}`)
    }
  }

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.text_template) {
      alert('Please fill in name and text template')
      return
    }

    try {
      const url = editingTemplate
        ? `/api/admin/social/templates/${editingTemplate.id}`
        : '/api/admin/social/templates'
      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save template')
      }

      alert(`Template ${editingTemplate ? 'updated' : 'created'} successfully!`)
      setShowTemplateForm(false)
      setEditingTemplate(null)
      setTemplateForm({
        platform: 'youtube',
        name: '',
        text_template: '',
        hashtag_template: '',
        tag_template: '',
      })
      await loadData()
    } catch (error: any) {
      console.error('Error saving template:', error)
      alert(`Error: ${error.message || 'Failed to save template'}`)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Delete this template?')) return

    try {
      const response = await fetch(`/api/admin/social/templates/${templateId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete template')
      }

      alert('Template deleted successfully!')
      await loadData()
    } catch (error: any) {
      console.error('Error deleting template:', error)
      alert(`Error: ${error.message || 'Failed to delete template'}`)
    }
  }

  const handleEditTemplate = (template: SocialTemplate) => {
    setEditingTemplate(template)
    setTemplateForm({
      platform: template.platform,
      name: template.name,
      text_template: template.text_template,
      hashtag_template: template.hashtag_template || '',
      tag_template: template.tag_template || '',
    })
    setShowTemplateForm(true)
  }

  // Hashtag handlers
  const handleSaveHashtagSet = async () => {
    if (!hashtagForm.name || hashtagForm.hashtags.length === 0) {
      alert('Please fill in name and add at least one hashtag')
      return
    }

    try {
      const url = editingHashtagSet
        ? `/api/admin/social/hashtags/${editingHashtagSet.id}`
        : '/api/admin/social/hashtags'
      const method = editingHashtagSet ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: hashtagForm.name,
          platform: hashtagForm.platform,
          hashtags: hashtagForm.hashtags,
          description: hashtagForm.description || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save hashtag set')
      }

      alert(`Hashtag set ${editingHashtagSet ? 'updated' : 'created'} successfully!`)
      setShowHashtagForm(false)
      setEditingHashtagSet(null)
      setHashtagForm({
        platform: 'instagram',
        name: '',
        hashtags: [],
        hashtagInput: '',
        description: '',
      })
      await loadHashtagSets()
    } catch (error: any) {
      console.error('Error saving hashtag set:', error)
      alert(`Error: ${error.message || 'Failed to save hashtag set'}`)
    }
  }

  const handleDeleteHashtagSet = async (id: string) => {
    if (!confirm('Delete this hashtag set?')) return

    try {
      const response = await fetch(`/api/admin/social/hashtags/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete hashtag set')
      }

      alert('Hashtag set deleted successfully!')
      await loadHashtagSets()
    } catch (error: any) {
      console.error('Error deleting hashtag set:', error)
      alert(`Error: ${error.message || 'Failed to delete hashtag set'}`)
    }
  }

  const handleEditHashtagSet = (set: SocialHashtagSet) => {
    setEditingHashtagSet(set)
    setHashtagForm({
      platform: set.platform,
      name: set.name,
      hashtags: set.hashtags,
      hashtagInput: set.hashtags.join(', '),
      description: set.description || '',
    })
    setShowHashtagForm(true)
  }

  const handleAddHashtag = () => {
    const hashtags = hashtagForm.hashtagInput
      .split(',')
      .map(h => h.trim())
      .filter(h => h && h.startsWith('#'))
      .map(h => h.startsWith('#') ? h : `#${h}`)
    
    setHashtagForm({
      ...hashtagForm,
      hashtags: [...new Set([...hashtagForm.hashtags, ...hashtags])],
      hashtagInput: '',
    })
  }

  const handleRemoveHashtag = (index: number) => {
    setHashtagForm({
      ...hashtagForm,
      hashtags: hashtagForm.hashtags.filter((_, i) => i !== index),
    })
  }

  // Tag pack handlers
  const handleSaveTagPack = async () => {
    if (!tagPackForm.name || !tagPackForm.tags) {
      alert('Please fill in name and tags')
      return
    }

    try {
      const url = editingTagPack
        ? `/api/admin/social/tagpacks/${editingTagPack.id}`
        : '/api/admin/social/tagpacks'
      const method = editingTagPack ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tagPackForm),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save tag pack')
      }

      alert(`Tag pack ${editingTagPack ? 'updated' : 'created'} successfully!`)
      setShowTagPackForm(false)
      setEditingTagPack(null)
      setTagPackForm({
        name: '',
        tags: '',
        description: '',
      })
      await loadTagPacks()
    } catch (error: any) {
      console.error('Error saving tag pack:', error)
      alert(`Error: ${error.message || 'Failed to save tag pack'}`)
    }
  }

  const handleDeleteTagPack = async (id: string) => {
    if (!confirm('Delete this tag pack?')) return

    try {
      const response = await fetch(`/api/admin/social/tagpacks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete tag pack')
      }

      alert('Tag pack deleted successfully!')
      await loadTagPacks()
    } catch (error: any) {
      console.error('Error deleting tag pack:', error)
      alert(`Error: ${error.message || 'Failed to delete tag pack'}`)
    }
  }

  const handleEditTagPack = (pack: SocialTagPack) => {
    setEditingTagPack(pack)
    setTagPackForm({
      name: pack.name,
      tags: pack.tags,
      description: pack.description || '',
    })
    setShowTagPackForm(true)
  }

  const filteredAssets = assets.filter(asset => {
    if (assetTypeFilter !== 'all' && asset.type !== assetTypeFilter) return false
    if (assetAspectFilter !== 'all' && asset.aspect_ratio !== assetAspectFilter) return false
    return true
  })

  const filteredTemplates = templates.filter(template => {
    if (templatePlatformFilter !== 'all' && template.platform !== templatePlatformFilter) return false
    return true
  })

  const filteredHashtagSets = hashtagSets.filter(set => {
    if (hashtagPlatformFilter !== 'all' && set.platform !== hashtagPlatformFilter) return false
    return true
  })

  const uniqueAspectRatios = Array.from(new Set(assets.map(a => a.aspect_ratio).filter(Boolean)))

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {[
            { key: 'assets', label: 'Assets', count: assets.length },
            { key: 'templates', label: 'Templates', count: templates.length },
            { key: 'hashtags', label: 'Hashtags', count: hashtagSets.length },
            { key: 'tags', label: 'Tag Packs', count: tagPacks.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Assets Tab */}
          {activeTab === 'assets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <select
                    value={assetTypeFilter}
                    onChange={(e) => setAssetTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                  </select>
                  <select
                    value={assetAspectFilter}
                    onChange={(e) => setAssetAspectFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Aspect Ratios</option>
                    {uniqueAspectRatios.map(ratio => (
                      <option key={ratio} value={ratio}>{ratio}</option>
                    ))}
                  </select>
                </div>
                <label className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer transition-colors">
                  {uploading ? 'Uploading...' : '+ Upload Asset'}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleAssetUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {filteredAssets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No assets found</p>
                  <label className="inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer transition-colors">
                    Upload Your First Asset
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleAssetUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredAssets.map((asset) => {
                    let publicUrl = ''
                    try {
                      const supabase = getSupabase()
                      const { data: urlData } = supabase.storage
                        .from('calisound')
                        .getPublicUrl(asset.storage_path)
                      publicUrl = urlData.publicUrl
                    } catch (error) {
                      console.error('Error getting public URL:', error)
                      publicUrl = '#'
                    }

                    return (
                      <div
                        key={asset.id}
                        className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                      >
                        {asset.type === 'image' ? (
                          <img
                            src={publicUrl}
                            alt={asset.storage_path}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ccc" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-4xl">🎥</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-opacity"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {asset.aspect_ratio || 'N/A'}
                          </p>
                          {asset.width && asset.height && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {asset.width}×{asset.height}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <select
                  value={templatePlatformFilter}
                  onChange={(e) => setTemplatePlatformFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Platforms</option>
                  {PLATFORMS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setEditingTemplate(null)
                    setTemplateForm({
                      platform: 'youtube',
                      name: '',
                      text_template: '',
                      hashtag_template: '',
                      tag_template: '',
                    })
                    setShowTemplateForm(true)
                  }}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  + New Template
                </button>
              </div>

              {showTemplateForm && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Platform
                      </label>
                      <select
                        value={templateForm.platform}
                        onChange={(e) => setTemplateForm({ ...templateForm, platform: e.target.value as SocialPlatform })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        {PLATFORMS.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Template Name
                      </label>
                      <input
                        type="text"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., City Release Template"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Text Template (use {`{city}`}, {`{title}`}, etc.)
                    </label>
                    <textarea
                      value={templateForm.text_template}
                      onChange={(e) => setTemplateForm({ ...templateForm, text_template: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="e.g., {city} OUT NOW! 🎵"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hashtag Template (optional)
                      </label>
                      <input
                        type="text"
                        value={templateForm.hashtag_template}
                        onChange={(e) => setTemplateForm({ ...templateForm, hashtag_template: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., #music #city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tag Template (optional)
                      </label>
                      <input
                        type="text"
                        value={templateForm.tag_template}
                        onChange={(e) => setTemplateForm({ ...templateForm, tag_template: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., music, city, release"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveTemplate}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {editingTemplate ? 'Update' : 'Create'} Template
                    </button>
                    <button
                      onClick={() => {
                        setShowTemplateForm(false)
                        setEditingTemplate(null)
                      }}
                      className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No templates found</p>
                  <button
                    onClick={() => setShowTemplateForm(true)}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Create Your First Template
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded">
                              {PLATFORMS.find(p => p.value === template.platform)?.label || template.platform}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {template.text_template}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              Created: {format(new Date(template.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hashtags Tab */}
          {activeTab === 'hashtags' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <select
                  value={hashtagPlatformFilter}
                  onChange={(e) => {
                    setHashtagPlatformFilter(e.target.value)
                    loadHashtagSets()
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Platforms</option>
                  {PLATFORMS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setEditingHashtagSet(null)
                    setHashtagForm({
                      platform: 'instagram',
                      name: '',
                      hashtags: [],
                      hashtagInput: '',
                      description: '',
                    })
                    setShowHashtagForm(true)
                  }}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  + New Hashtag Set
                </button>
              </div>

              {showHashtagForm && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Platform
                      </label>
                      <select
                        value={hashtagForm.platform}
                        onChange={(e) => setHashtagForm({ ...hashtagForm, platform: e.target.value as SocialPlatform })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        {PLATFORMS.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Set Name
                      </label>
                      <input
                        type="text"
                        value={hashtagForm.name}
                        onChange={(e) => setHashtagForm({ ...hashtagForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., City Release Hashtags"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hashtags (comma-separated, with or without #)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={hashtagForm.hashtagInput}
                        onChange={(e) => setHashtagForm({ ...hashtagForm, hashtagInput: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddHashtag()
                          }
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., #music, #city, #release"
                      />
                      <button
                        onClick={handleAddHashtag}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {hashtagForm.hashtags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {hashtagForm.hashtags.map((hashtag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm flex items-center gap-2"
                          >
                            {hashtag}
                            <button
                              onClick={() => handleRemoveHashtag(index)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={hashtagForm.description}
                      onChange={(e) => setHashtagForm({ ...hashtagForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="e.g., Standard hashtags for city releases"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveHashtagSet}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {editingHashtagSet ? 'Update' : 'Create'} Set
                    </button>
                    <button
                      onClick={() => {
                        setShowHashtagForm(false)
                        setEditingHashtagSet(null)
                      }}
                      className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {filteredHashtagSets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No hashtag sets found</p>
                  <button
                    onClick={() => setShowHashtagForm(true)}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Create Your First Hashtag Set
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHashtagSets.map((set) => (
                    <div
                      key={set.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {set.name}
                            </h3>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded">
                              {PLATFORMS.find(p => p.value === set.platform)?.label || set.platform}
                            </span>
                            {set.usage_count > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Used {set.usage_count} time{set.usage_count !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {set.hashtags.map((hashtag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                              >
                                {hashtag}
                              </span>
                            ))}
                          </div>
                          {set.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {set.description}
                            </p>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Created: {format(new Date(set.created_at), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditHashtagSet(set)}
                            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteHashtagSet(set.id)}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags Tab */}
          {activeTab === 'tags' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div></div>
                <button
                  onClick={() => {
                    setEditingTagPack(null)
                    setTagPackForm({
                      name: '',
                      tags: '',
                      description: '',
                    })
                    setShowTagPackForm(true)
                  }}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  + New Tag Pack
                </button>
              </div>

              {showTagPackForm && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pack Name
                    </label>
                    <input
                      type="text"
                      value={tagPackForm.name}
                      onChange={(e) => setTagPackForm({ ...tagPackForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="e.g., Electronic Music Tags"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags (comma-separated for YouTube)
                    </label>
                    <textarea
                      value={tagPackForm.tags}
                      onChange={(e) => setTagPackForm({ ...tagPackForm, tags: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="e.g., electronic music, house music, techno, calisound"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={tagPackForm.description}
                      onChange={(e) => setTagPackForm({ ...tagPackForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="e.g., Standard tags for electronic music releases"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveTagPack}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {editingTagPack ? 'Update' : 'Create'} Pack
                    </button>
                    <button
                      onClick={() => {
                        setShowTagPackForm(false)
                        setEditingTagPack(null)
                      }}
                      className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {tagPacks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No tag packs found</p>
                  <button
                    onClick={() => setShowTagPackForm(true)}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Create Your First Tag Pack
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tagPacks.map((pack) => (
                    <div
                      key={pack.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {pack.name}
                            </h3>
                            {pack.usage_count > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Used {pack.usage_count} time{pack.usage_count !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {pack.tags}
                          </p>
                          {pack.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {pack.description}
                            </p>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Created: {format(new Date(pack.created_at), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditTagPack(pack)}
                            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTagPack(pack.id)}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
