'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Release, PlatformPlan, PromotionDay, DailyTask, ReleaseAsset, EmailLog } from '@/types/release-planning'
import { PLATFORM_LABELS, PLATFORM_UPLOAD_LINKS } from '@/types/release-planning'

interface ReleaseDetailProps {
  release: Release
  platformPlans: PlatformPlan[]
  promotionDays: PromotionDay[]
  dailyTasks: DailyTask[]
  assets: ReleaseAsset[]
  emailLogs: EmailLog[]
}

// Safe date formatting - using native JavaScript only
function formatDate(date: Date, formatStr: string): string {
  if (formatStr === 'MMM d, yyyy HH:mm') {
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
  }
  if (formatStr === 'MMM d, yyyy') {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }
  return date.toLocaleString('en-US')
}

export function ReleaseDetail({
  release: initialRelease,
  platformPlans: initialPlatformPlans,
  promotionDays: initialPromotionDays,
  dailyTasks: initialDailyTasks,
  assets: initialAssets,
  emailLogs: initialEmailLogs,
}: ReleaseDetailProps) {
  const [release] = useState(initialRelease)
  const [platformPlans] = useState(initialPlatformPlans)
  const [promotionDays] = useState(initialPromotionDays)
  const [dailyTasks, setDailyTasks] = useState(initialDailyTasks)
  const [assets, setAssets] = useState(initialAssets)
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'platforms' | 'copy' | 'emails'>('overview')
  const [generatingCopy, setGeneratingCopy] = useState(false)
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set())
  const [uploadingAsset, setUploadingAsset] = useState(false)

  const releaseDate = new Date(release.release_at)
  const now = new Date()
  const daysUntilRelease = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          {release.song_title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {release.city && release.country ? `${release.city}, ${release.country}` : release.city || release.country || 'No location'}
        </p>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-lg text-sm font-medium text-white ${
          release.status === 'draft' ? 'bg-gray-500' :
          release.status === 'planning' ? 'bg-blue-500' :
          release.status === 'active' ? 'bg-green-500' :
          'bg-purple-500'
        }`}>
          {release.status}
        </span>
        {release.fast_mode && (
          <span className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm font-medium">
            ⚡ Fast Mode
          </span>
        )}
        <span className="text-gray-600 dark:text-gray-400">
          Release: {formatDate(releaseDate, 'MMM d, yyyy HH:mm')} ({release.timezone})
        </span>
        <span className={`font-medium ${
          daysUntilRelease < 0 ? 'text-purple-500' :
          daysUntilRelease === 0 ? 'text-green-500' :
          daysUntilRelease < 7 ? 'text-orange-500' :
          'text-blue-500'
        }`}>
          {daysUntilRelease < 0 ? `T+${Math.abs(daysUntilRelease)}` :
           daysUntilRelease === 0 ? 'Today' :
           `T-${daysUntilRelease}`}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {(['overview', 'timeline', 'platforms', 'copy', 'emails'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Release Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Language:</span>
                  <span className="text-white">{release.local_language} ({release.local_language_code})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Include English:</span>
                  <span className="text-white">{release.include_english ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Timezone:</span>
                  <span className="text-white">{release.timezone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="text-white">{release.status}</span>
                </div>
              </div>
            </div>

            {/* Generation Status */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Generation Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Timeline:</span>
                  <span className={promotionDays.length > 0 ? 'text-green-500' : 'text-yellow-500'}>
                    {promotionDays.length > 0 ? `${promotionDays.length} days` : 'Not generated'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Platform Plans:</span>
                  <span className={platformPlans.length > 0 ? 'text-green-500' : 'text-yellow-500'}>
                    {platformPlans.length > 0 ? `${platformPlans.length} plans` : 'Not generated'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Daily Tasks:</span>
                  <span className={dailyTasks.length > 0 ? 'text-green-500' : 'text-yellow-500'}>
                    {dailyTasks.length > 0 ? `${dailyTasks.length} tasks` : 'Not generated'}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={async () => {
                    const message = (promotionDays.length > 0 || platformPlans.length > 0)
                      ? 'Regenerate timeline and platform plans? This will delete existing data and create new ones.'
                      : 'Generate timeline and platform plans? This may take a moment.'
                    
                    if (confirm(message)) {
                      try {
                        const response = await fetch(`/api/admin/releases/${release.id}/generate`, {
                          method: 'POST',
                        })
                        if (response.ok) {
                          alert('Generation started! Please refresh the page in a few seconds.')
                          setTimeout(() => window.location.reload(), 2000)
                        } else {
                          const error = await response.json()
                          throw new Error(error.error || 'Failed to generate')
                        }
                      } catch (error: any) {
                        alert(`Error: ${error.message || 'Failed to generate'}`)
                      }
                    }
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {(promotionDays.length > 0 || platformPlans.length > 0) ? 'Regenerate' : 'Generate'} Timeline & Platform Plans
                </button>
              </div>
            </div>

            {/* Assets Section */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Release Assets</h4>
              
              {/* Upload Form */}
              <div className="mb-4 space-y-3">
                <div className="flex gap-2">
                  <select
                    id="asset-kind"
                    className="px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg text-sm"
                    defaultValue="16_9"
                  >
                    <option value="16_9">16:9 (Landscape)</option>
                    <option value="9_16">9:16 (Portrait/Reels)</option>
                    <option value="1_1">1:1 (Square)</option>
                    <option value="audio">Audio</option>
                  </select>
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,audio/*,video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        const kindSelect = document.getElementById('asset-kind') as HTMLSelectElement
                        const kind = kindSelect.value

                        setUploadingAsset(true)
                        try {
                          const formData = new FormData()
                          formData.append('file', file)
                          formData.append('kind', kind)

                          const response = await fetch(`/api/admin/releases/${release.id}/assets`, {
                            method: 'POST',
                            body: formData,
                          })

                          if (response.ok) {
                            const newAsset = await response.json()
                            setAssets(prev => [...prev, newAsset])
                            alert('Asset uploaded successfully!')
                            // Reset file input
                            e.target.value = ''
                          } else {
                            const error = await response.json()
                            throw new Error(error.error || 'Failed to upload asset')
                          }
                        } catch (error: any) {
                          alert(`Error: ${error.message || 'Failed to upload asset'}`)
                        } finally {
                          setUploadingAsset(false)
                        }
                      }}
                      disabled={uploadingAsset}
                    />
                    <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      uploadingAsset
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:bg-orange-700 cursor-pointer'
                    }`}>
                      {uploadingAsset ? 'Uploading...' : 'Upload Asset'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Assets List */}
              {assets.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  No assets uploaded yet. Upload images or audio files for this release.
                </p>
              ) : (
                <div className="space-y-2">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {asset.url && (asset.kind === 'audio' ? (
                          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                            🎵
                          </div>
                        ) : (
                          <img
                            src={asset.url}
                            alt={asset.kind}
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ))}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {asset.kind === '16_9' ? '16:9 (Landscape)' :
                             asset.kind === '9_16' ? '9:16 (Portrait/Reels)' :
                             asset.kind === '1_1' ? '1:1 (Square)' :
                             'Audio'}
                          </p>
                          {asset.url && (
                            <a
                              href={asset.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-orange-500 hover:underline"
                            >
                              View
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this asset?')) {
                            try {
                              const response = await fetch(`/api/admin/releases/${release.id}/assets/${asset.id}`, {
                                method: 'DELETE',
                              })
                              if (response.ok) {
                                setAssets(prev => prev.filter(a => a.id !== asset.id))
                                alert('Asset deleted successfully!')
                              } else {
                                const error = await response.json()
                                throw new Error(error.error || 'Failed to delete asset')
                              }
                            } catch (error: any) {
                              alert(`Error: ${error.message || 'Failed to delete asset'}`)
                            }
                          }
                        }}
                        className="px-3 py-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {promotionDays.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Timeline has not been generated yet.
                </p>
                <button
                  onClick={async () => {
                    if (confirm('Generate timeline? This will create promotion days and daily tasks.')) {
                      try {
                        const response = await fetch(`/api/admin/releases/${release.id}/generate`, {
                          method: 'POST',
                        })
                        if (response.ok) {
                          alert('Timeline generation started! Please refresh the page in a few seconds.')
                          setTimeout(() => window.location.reload(), 2000)
                        } else {
                          const error = await response.json()
                          throw new Error(error.error || 'Failed to generate')
                        }
                      } catch (error: any) {
                        alert(`Error: ${error.message || 'Failed to generate timeline'}`)
                      }
                    }
                  }}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Generate Timeline
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={async () => {
                      if (confirm('Regenerate timeline? This will delete existing timeline and create a new one.')) {
                        try {
                          const response = await fetch(`/api/admin/releases/${release.id}/generate`, {
                            method: 'POST',
                          })
                          if (response.ok) {
                            alert('Timeline regeneration started! Please refresh the page in a few seconds.')
                            setTimeout(() => window.location.reload(), 2000)
                          } else {
                            const error = await response.json()
                            throw new Error(error.error || 'Failed to regenerate')
                          }
                        } catch (error: any) {
                          alert(`Error: ${error.message || 'Failed to regenerate timeline'}`)
                        }
                      }
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Regenerate Timeline
                  </button>
                </div>
                <div className="space-y-4">
                  {promotionDays.map((day) => {
                  const dayTasks = dailyTasks.filter(t => t.day_offset === day.day_offset)
                  const completedTasks = dayTasks.filter(t => t.completed).length
                  const totalTasks = dayTasks.length
                  
                  return (
                    <div
                      key={day.id}
                      className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white">
                            {day.day_offset < 0 ? `T${day.day_offset}` : day.day_offset === 0 ? 'Release Day' : `T+${day.day_offset}`}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(new Date(day.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        {totalTasks > 0 && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {completedTasks}/{totalTasks} tasks
                          </span>
                        )}
                      </div>
                      {day.focus && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <strong>Focus:</strong> {day.focus}
                        </p>
                      )}
                      {dayTasks.length > 0 && (
                        <div className="space-y-2">
                          {dayTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-3 rounded-lg border-l-4 ${
                                task.completed
                                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                  : task.priority === 1
                                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                  : task.priority === 2
                                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                                  : 'bg-gray-50 dark:bg-gray-900 border-gray-500'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={task.completed}
                                      disabled={updatingTasks.has(task.id)}
                                      onChange={async (e) => {
                                        const newCompleted = e.target.checked
                                        setUpdatingTasks(prev => new Set(prev).add(task.id))
                                        
                                        try {
                                          const response = await fetch(`/api/admin/releases/${release.id}/tasks/${task.id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ completed: newCompleted }),
                                          })
                                          
                                          if (response.ok) {
                                            // Update local state
                                            setDailyTasks(prev => prev.map(t => 
                                              t.id === task.id ? { ...t, completed: newCompleted } : t
                                            ))
                                          } else {
                                            const error = await response.json()
                                            throw new Error(error.error || 'Failed to update task')
                                          }
                                        } catch (error: any) {
                                          alert(`Error: ${error.message || 'Failed to update task'}`)
                                          // Revert checkbox
                                          e.target.checked = !newCompleted
                                        } finally {
                                          setUpdatingTasks(prev => {
                                            const next = new Set(prev)
                                            next.delete(task.id)
                                            return next
                                          })
                                        }
                                      }}
                                      className="w-4 h-4 cursor-pointer disabled:opacity-50"
                                    />
                                    <span className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                                      {task.title}
                                    </span>
                                  </div>
                                  {task.details && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-6">
                                      {task.details}
                                    </p>
                                  )}
                                  {task.platform && (
                                    <span className="text-xs text-gray-500 dark:text-gray-500 ml-6">
                                      Platform: {PLATFORM_LABELS[task.platform]}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'platforms' && (
          <div className="space-y-4">
            <div className="mb-4 flex justify-between items-center">
              {platformPlans.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  Platform plans have not been generated yet.
                </p>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  {platformPlans.length} platform plan(s) generated
                </p>
              )}
              <button
                onClick={async () => {
                  const platforms = prompt('Enter platforms (comma-separated) or leave empty for defaults:\nyoutube, youtube_shorts, instagram_reels, instagram_story, tiktok, twitter, soundcloud')
                  const platformList = platforms
                    ? platforms.split(',').map(p => p.trim()).filter(Boolean)
                    : []
                  
                  if (platforms !== null) { // User didn't cancel
                    try {
                      const response = await fetch(`/api/admin/releases/${release.id}/generate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          platforms: platformList.length > 0 ? platformList : undefined,
                        }),
                      })
                      if (response.ok) {
                        alert('Platform plans generation started! Please refresh the page in a few seconds.')
                        setTimeout(() => window.location.reload(), 2000)
                      } else {
                        const error = await response.json()
                        throw new Error(error.error || 'Failed to generate')
                      }
                    } catch (error: any) {
                      alert(`Error: ${error.message || 'Failed to generate platform plans'}`)
                    }
                  }
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                {platformPlans.length > 0 ? 'Regenerate' : 'Generate'} Platform Plans
              </button>
            </div>
            {platformPlans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Click the button above to generate platform plans.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={async () => {
                      setGeneratingCopy(true)
                      try {
                        const response = await fetch(`/api/admin/releases/${release.id}/generate-copy`, {
                          method: 'POST',
                        })
                        if (response.ok) {
                          alert('AI copy generated successfully!')
                          window.location.reload()
                        } else {
                          const error = await response.json()
                          throw new Error(error.error || 'Failed to generate copy')
                        }
                      } catch (error: any) {
                        alert(`Error: ${error.message || 'Failed to generate copy'}`)
                      } finally {
                        setGeneratingCopy(false)
                      }
                    }}
                    disabled={generatingCopy}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    {generatingCopy ? 'Generating...' : 'Generate All Copy (AI)'}
                  </button>
                </div>
                <div className="space-y-4">
                  {platformPlans.map((plan) => {
                    const plannedAt = new Date(plan.planned_at)
                    return (
                      <div
                        key={plan.id}
                        className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-white">
                              {PLATFORM_LABELS[plan.platform]}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(plannedAt, 'MMM d, yyyy HH:mm')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              plan.status === 'published' ? 'bg-green-500 text-white' :
                              plan.status === 'reminded' ? 'bg-blue-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {plan.status}
                            </span>
                            {plan.ai_generated && (
                              <span className="px-2 py-1 text-xs bg-purple-500 text-white rounded">
                                AI
                              </span>
                            )}
                          </div>
                        </div>
                        {plan.title && (
                          <div className="mb-2">
                            <strong className="text-white">Title:</strong>
                            <p className="text-gray-300">{plan.title}</p>
                          </div>
                        )}
                        {plan.description && (
                          <div className="mb-2">
                            <strong className="text-white">Description:</strong>
                            <p className="text-gray-300 whitespace-pre-wrap">{plan.description}</p>
                          </div>
                        )}
                        {plan.hashtags && plan.hashtags.length > 0 && (
                          <div className="mb-2">
                            <strong className="text-white">Hashtags:</strong>
                            <p className="text-gray-300">{plan.hashtags.join(' ')}</p>
                          </div>
                        )}
                        {plan.tags && (
                          <div className="mb-2">
                            <strong className="text-white">Tags:</strong>
                            <p className="text-gray-300">{plan.tags}</p>
                          </div>
                        )}
                        {plan.asset_urls && plan.asset_urls.length > 0 && (
                          <div className="mb-2">
                            <strong className="text-white">Assets:</strong>
                            <ul className="list-disc list-inside text-gray-300">
                              {plan.asset_urls.map((url, i) => (
                                <li key={i}>
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                                    {url}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {plan.quick_upload_link && (
                          <div className="mt-3">
                            <a
                              href={plan.quick_upload_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                            >
                              Upload to {PLATFORM_LABELS[plan.platform]} →
                            </a>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'copy' && (
          <div className="space-y-4">
            {platformPlans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Copy pack will be available after platform plans are generated.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Go to the "Platforms" tab to generate platform plans first.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {platformPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                  >
                    <h4 className="font-semibold text-white mb-3">
                      {PLATFORM_LABELS[plan.platform]}
                    </h4>
                    <div className="space-y-3">
                      {plan.title && (
                        <div>
                          <strong className="text-gray-400 text-sm">Title:</strong>
                          <p className="text-white mt-1">{plan.title}</p>
                        </div>
                      )}
                      {plan.description && (
                        <div>
                          <strong className="text-gray-400 text-sm">Description:</strong>
                          <p className="text-white mt-1 whitespace-pre-wrap">{plan.description}</p>
                        </div>
                      )}
                      {plan.hashtags && plan.hashtags.length > 0 && (
                        <div>
                          <strong className="text-gray-400 text-sm">Hashtags:</strong>
                          <p className="text-white mt-1">{plan.hashtags.join(' ')}</p>
                        </div>
                      )}
                      {plan.tags && (
                        <div>
                          <strong className="text-gray-400 text-sm">Tags (YouTube):</strong>
                          <p className="text-white mt-1">{plan.tags}</p>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const copyText = [
                            plan.title,
                            plan.description,
                            plan.hashtags?.join(' '),
                            plan.tags ? `Tags: ${plan.tags}` : '',
                          ].filter(Boolean).join('\n\n')
                          navigator.clipboard.writeText(copyText)
                          alert('Copy text copied to clipboard!')
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Email Logs</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Daily task emails are sent at 10:00 (Europe/Istanbul time).<br/>
                Reminder emails are sent 2 hours before each planned post.
              </p>
            </div>

            {initialEmailLogs.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  No emails sent yet.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Email logs will appear here once emails are sent via cron jobs.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {initialEmailLogs.map((log) => {
                  const sentDate = new Date(log.sent_at)
                  const platformPlan = log.platform_plan_id 
                    ? platformPlans.find(p => p.id === log.platform_plan_id)
                    : null

                  return (
                    <div
                      key={log.id}
                      className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 text-xs rounded font-medium ${
                              log.type === 'daily_task'
                                ? 'bg-blue-500 text-white'
                                : 'bg-purple-500 text-white'
                            }`}>
                              {log.type === 'daily_task' ? 'Daily Task' : 'Reminder'}
                            </span>
                            {platformPlan && (
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {PLATFORM_LABELS[platformPlan.platform]}
                              </span>
                            )}
                          </div>
                          {log.subject && (
                            <p className="font-semibold text-white mb-1">
                              {log.subject}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            To: {log.recipient}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatDate(sentDate, 'MMM d, yyyy HH:mm')}
                          </p>
                          {log.content_preview && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                              {log.content_preview}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
