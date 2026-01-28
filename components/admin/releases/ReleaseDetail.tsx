'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Release, PlatformPlan, PromotionDay, DailyTask, ReleaseAsset, EmailLog } from '@/types/release-planning'
import { PLATFORM_LABELS, PLATFORM_UPLOAD_LINKS } from '@/types/release-planning'
import { GenerationProgressModal } from './GenerationProgressModal'
import type { GenerationStep } from './GenerationProgressModal'

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
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'platforms' | 'copy' | 'emails' | 'analytics'>('overview')
  const [generatingCopy, setGeneratingCopy] = useState(false)
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set())
  const [uploadingAsset, setUploadingAsset] = useState(false)
  
  // Progress modal state
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [progressSteps, setProgressSteps] = useState<GenerationStep[]>([])
  const [overallProgress, setOverallProgress] = useState(0)
  const [progressError, setProgressError] = useState<string | undefined>()
  const [generationCancelled, setGenerationCancelled] = useState(false)

  const releaseDate = new Date(release.release_at)
  const now = new Date()
  const daysUntilRelease = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Helper function to update a step
  const updateStep = (
    stepId: string,
    status: GenerationStep['status'],
    message?: string,
    details?: string,
    progress?: number
  ) => {
    setProgressSteps(prev => prev.map(step => 
      step.id === stepId
        ? { ...step, status, message, details, progress }
        : step
    ))
  }

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
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-lg text-sm font-medium text-white ${
            release.status === 'draft' ? 'bg-gray-500' :
            release.status === 'planning' ? 'bg-blue-500' :
            release.status === 'active' ? 'bg-green-500' :
            'bg-purple-500'
          }`}>
            {release.status}
          </span>
          {release.status !== 'active' && (
            <button
              onClick={async () => {
                if (confirm(`Change status from "${release.status}" to "active"?`)) {
                  try {
                    const response = await fetch(`/api/admin/releases/${release.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'active' }),
                    })
                    if (response.ok) {
                      alert('Status updated to active!')
                      window.location.reload()
                    } else {
                      const error = await response.json()
                      throw new Error(error.error || 'Failed to update status')
                    }
                  } catch (error: any) {
                    alert(`Error: ${error.message || 'Failed to update status'}`)
                  }
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
            >
              ✅ Activate Release
            </button>
          )}
          <button
            onClick={async () => {
              const templateName = prompt('Enter template name:', `${release.song_title} - ${release.city || 'Template'}`)
              if (!templateName) return

              const tagsInput = prompt('Enter tags (comma-separated, optional):', '')
              const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : []

              try {
                const response = await fetch('/api/admin/templates', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: templateName,
                    description: `Template based on "${release.song_title}" release`,
                    default_city: release.city,
                    default_country: release.country,
                    default_local_language: release.local_language,
                    default_local_language_code: release.local_language_code,
                    default_include_english: release.include_english,
                    default_timezone: release.timezone,
                    default_fast_mode: release.fast_mode,
                    default_platforms: platformPlans.map(p => p.platform),
                    tags: tags,
                    is_public: false,
                  }),
                })

                if (response.ok) {
                  alert(`Template "${templateName}" created successfully!`)
                } else {
                  const error = await response.json()
                  throw new Error(error.error || 'Failed to create template')
                }
              } catch (error: any) {
                alert(`Error: ${error.message || 'Failed to save template'}`)
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            💾 Save as Template
          </button>
        </div>
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
        {(['overview', 'timeline', 'platforms', 'copy', 'emails', 'analytics'] as const).map(tab => (
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

              <div className="mt-4 flex gap-2">
                <button
                  onClick={async () => {
                    console.log('[Client] ===== GENERATE TIMELINE BUTTON CLICKED =====')
                    console.log('[Client] Release ID:', release.id)
                    console.log('[Client] Is regenerate:', promotionDays.length > 0 || platformPlans.length > 0)
                    
                    const isRegenerate = promotionDays.length > 0 || platformPlans.length > 0
                    
                    // Initialize progress modal
                    setShowProgressModal(true)
                    setProgressError(undefined)
                    setGenerationCancelled(false)
                    setProgressSteps([
                      { id: 'init', label: 'Initializing...', status: 'pending' },
                      { id: 'timeline', label: 'Generating AI Timeline', status: 'pending' },
                      { id: 'platforms', label: 'Generating Platform Plans', status: 'pending' },
                      { id: 'posting-times', label: 'Calculating Optimal Posting Times', status: 'pending' },
                      { id: 'complete', label: 'Finalizing...', status: 'pending' },
                    ])
                    setOverallProgress(0)

                    try {
                      // Step 1: Initialize
                      console.log('[Client] Step 1: Initializing...')
                      updateStep('init', 'in_progress', 'Preparing generation...', undefined, 0)
                      setOverallProgress(5)
                      await new Promise(resolve => setTimeout(resolve, 500))

                      // Step 2: Generate Timeline
                      console.log('[Client] Step 2: Generating Timeline...')
                      updateStep('init', 'completed', 'Ready')
                      updateStep('timeline', 'in_progress', 'Creating detailed timeline with AI...', 'Connecting to OpenAI API...', 10)
                      setOverallProgress(20)

                      const apiUrl = `/api/admin/releases/${release.id}/generate`
                      console.log('[Client] Fetching timeline from:', apiUrl)
                      const fetchStartTime = Date.now()
                      
                      const timelineResponse = await fetch(apiUrl, {
                        method: 'POST',
                      })
                      
                      const fetchDuration = Date.now() - fetchStartTime
                      console.log('[Client] Timeline fetch completed in', fetchDuration, 'ms')
                      console.log('[Client] Timeline response status:', timelineResponse.status)
                      console.log('[Client] Timeline response OK:', timelineResponse.ok)

                      if (!timelineResponse.ok) {
                        const errorText = await timelineResponse.text()
                        console.error('[Client] Timeline generation failed:', errorText)
                        let error
                        try {
                          error = JSON.parse(errorText)
                        } catch {
                          error = { error: errorText }
                        }
                        throw new Error(error.error || 'Failed to generate timeline')
                      }
                      
                      const timelineResult = await timelineResponse.json()
                      console.log('[Client] Timeline generation result:', timelineResult)

                      console.log('[Client] Step 2: Timeline generated successfully')
                      updateStep('timeline', 'completed', 'Timeline generated successfully')
                      setOverallProgress(50)

                      // Step 3: Generate Platform Plans
                      console.log('[Client] Step 3: Platform plans already generated in same endpoint')
                      updateStep('platforms', 'in_progress', 'Creating platform plans...', 'Generating platform-specific content...', 60)
                      setOverallProgress(70)

                      // Platform plans are generated in the same endpoint, so we just wait a bit
                      await new Promise(resolve => setTimeout(resolve, 2000))
                      console.log('[Client] Step 3: Platform plans created')
                      updateStep('platforms', 'completed', 'Platform plans created')
                      setOverallProgress(85)

                      // Step 4: Optimal Posting Times
                      console.log('[Client] Step 4: Calculating optimal posting times...')
                      updateStep('posting-times', 'in_progress', 'Calculating best posting times...', 'Using AI to determine optimal engagement times...', 90)
                      setOverallProgress(90)
                      await new Promise(resolve => setTimeout(resolve, 1000))
                      console.log('[Client] Step 4: Posting times optimized')
                      updateStep('posting-times', 'completed', 'Posting times optimized')
                      setOverallProgress(95)

                      // Step 5: Complete
                      console.log('[Client] Step 5: Generation complete!')
                      updateStep('complete', 'completed', 'Generation complete!')
                      setOverallProgress(100)

                      // Reload after a short delay
                      console.log('[Client] Reloading page in 1.5 seconds...')
                      setTimeout(() => {
                        window.location.reload()
                      }, 1500)
                    } catch (error: any) {
                      console.error('[Client] ===== TIMELINE GENERATION ERROR =====')
                      console.error('[Client] Error type:', error?.constructor?.name)
                      console.error('[Client] Error message:', error?.message)
                      console.error('[Client] Error stack:', error?.stack)
                      console.error('[Client] Full error object:', error)
                      console.error('[Client] =====================================')
                      setProgressError(error.message || 'Failed to generate')
                      updateStep('timeline', 'error', error.message || 'Generation failed')
                    }
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {(promotionDays.length > 0 || platformPlans.length > 0) ? 'Regenerate' : 'Generate'} Timeline & Platform Plans
                </button>
                {release.status === 'active' && promotionDays.length > 0 && (
                  <button
                    onClick={async () => {
                      if (confirm('Send test emails? This will send a daily task email and a reminder email to test the system.')) {
                        try {
                          const response = await fetch('/api/admin/releases/test-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ releaseId: release.id }),
                          })
                          const result = await response.json()
                          if (response.ok) {
                            const messages = []
                            if (result.results.dailyTaskEmail.sent) {
                              messages.push('✅ Daily task email sent!')
                            } else {
                              messages.push(`❌ Daily task email: ${result.results.dailyTaskEmail.error || 'Failed'}`)
                            }
                            if (result.results.reminderEmail.sent) {
                              messages.push('✅ Reminder email sent!')
                            } else {
                              messages.push(`❌ Reminder email: ${result.results.reminderEmail.error || 'Failed'}`)
                            }
                            alert(messages.join('\n'))
                            window.location.reload()
                          } else {
                            throw new Error(result.error || 'Failed to send test emails')
                          }
                        } catch (error: any) {
                          alert(`Error: ${error.message || 'Failed to send test emails'}`)
                        }
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📧 Test Emails
                  </button>
                )}
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
                    // Initialize progress modal
                    setShowProgressModal(true)
                    setProgressError(undefined)
                    setGenerationCancelled(false)
                    setProgressSteps([
                      { id: 'init', label: 'Initializing...', status: 'pending' },
                      { id: 'timeline', label: 'Generating AI Timeline', status: 'pending' },
                      { id: 'complete', label: 'Finalizing...', status: 'pending' },
                    ])
                    setOverallProgress(0)

                    try {
                      updateStep('init', 'in_progress', 'Preparing...', undefined, 0)
                      setOverallProgress(5)
                      await new Promise(resolve => setTimeout(resolve, 500))

                      updateStep('init', 'completed', 'Ready')
                      updateStep('timeline', 'in_progress', 'Creating detailed timeline with AI...', 'Connecting to OpenAI and generating tasks...', 20)
                      setOverallProgress(30)

                      const response = await fetch(`/api/admin/releases/${release.id}/generate`, {
                        method: 'POST',
                      })
                      
                      if (!response.ok) {
                        const error = await response.json()
                        throw new Error(error.error || 'Failed to generate')
                      }

                      updateStep('timeline', 'completed', 'Timeline generated successfully')
                      setOverallProgress(80)
                      updateStep('complete', 'in_progress', 'Saving...', undefined, 90)
                      setOverallProgress(90)
                      await new Promise(resolve => setTimeout(resolve, 500))
                      updateStep('complete', 'completed', 'Complete!')
                      setOverallProgress(100)

                      setTimeout(() => window.location.reload(), 1500)
                    } catch (error: any) {
                      setProgressError(error.message || 'Failed to generate timeline')
                      updateStep('timeline', 'error', error.message || 'Generation failed')
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
                      // Initialize progress modal
                      setShowProgressModal(true)
                      setProgressError(undefined)
                      setGenerationCancelled(false)
                      setProgressSteps([
                        { id: 'init', label: 'Initializing...', status: 'pending' },
                        { id: 'delete', label: 'Deleting existing timeline...', status: 'pending' },
                        { id: 'timeline', label: 'Generating AI Timeline', status: 'pending' },
                        { id: 'complete', label: 'Finalizing...', status: 'pending' },
                      ])
                      setOverallProgress(0)

                      try {
                        updateStep('init', 'in_progress', 'Preparing...', undefined, 0)
                        setOverallProgress(5)
                        await new Promise(resolve => setTimeout(resolve, 300))

                        updateStep('init', 'completed', 'Ready')
                        updateStep('delete', 'in_progress', 'Removing old timeline...', undefined, 10)
                        setOverallProgress(15)
                        await new Promise(resolve => setTimeout(resolve, 500))

                        updateStep('delete', 'completed', 'Old timeline removed')
                        updateStep('timeline', 'in_progress', 'Creating new timeline with AI...', 'Connecting to OpenAI and generating detailed tasks...', 30)
                        setOverallProgress(40)

                        const response = await fetch(`/api/admin/releases/${release.id}/generate`, {
                          method: 'POST',
                        })
                        
                        if (!response.ok) {
                          const error = await response.json()
                          throw new Error(error.error || 'Failed to regenerate')
                        }

                        updateStep('timeline', 'completed', 'New timeline generated')
                        setOverallProgress(85)
                        updateStep('complete', 'in_progress', 'Saving...', undefined, 90)
                        setOverallProgress(90)
                        await new Promise(resolve => setTimeout(resolve, 500))
                        updateStep('complete', 'completed', 'Complete!')
                        setOverallProgress(100)

                        setTimeout(() => window.location.reload(), 1500)
                      } catch (error: any) {
                        setProgressError(error.message || 'Failed to regenerate timeline')
                        updateStep('timeline', 'error', error.message || 'Regeneration failed')
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
                          <div className="flex items-center gap-3">
                            <div className="flex-1 w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-white min-w-[60px] text-right">
                              {completedTasks}/{totalTasks} tasks
                            </span>
                            {completedTasks < totalTasks && (
                              <button
                                onClick={async () => {
                                  if (confirm(`Mark all ${totalTasks} tasks for this day as complete?`)) {
                                    const incompleteTasks = dayTasks.filter(t => !t.completed)
                                    setUpdatingTasks(prev => new Set([...prev, ...incompleteTasks.map(t => t.id)]))
                                    
                                    try {
                                      await Promise.all(
                                        incompleteTasks.map(task =>
                                          fetch(`/api/admin/releases/${release.id}/tasks/${task.id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ completed: true }),
                                          })
                                        )
                                      )
                                      
                                      // Update local state
                                      setDailyTasks(prev => prev.map(t => 
                                        dayTasks.some(dt => dt.id === t.id) && !t.completed
                                          ? { ...t, completed: true, completed_at: new Date().toISOString() }
                                          : t
                                      ))
                                    } catch (error: any) {
                                      alert(`Error: ${error.message || 'Failed to update tasks'}`)
                                    } finally {
                                      setUpdatingTasks(prev => {
                                        const next = new Set(prev)
                                        incompleteTasks.forEach(t => next.delete(t.id))
                                        return next
                                      })
                                    }
                                  }
                                }}
                                className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                disabled={updatingTasks.size > 0}
                              >
                                Mark All Complete
                              </button>
                            )}
                          </div>
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
                                            const updatedTask = await response.json()
                                            // Update local state with server response
                                            setDailyTasks(prev => prev.map(t => 
                                              t.id === task.id ? { ...t, ...updatedTask } : t
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
                                    <div className="flex-1">
                                      <span className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                                        {task.title}
                                      </span>
                                      {task.completed && task.completed_at && (
                                        <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                                          (Completed {formatDate(new Date(task.completed_at), 'MMM d, yyyy HH:mm')})
                                        </span>
                                      )}
                                    </div>
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
                      console.log('[Client] ===== BUTTON CLICKED =====')
                      console.log('[Client] Release ID:', release.id)
                      console.log('[Client] Platform plans count:', platformPlans.length)
                      console.log('[Client] generatingCopy state:', generatingCopy)
                      
                      // Initialize progress modal
                      setShowProgressModal(true)
                      setProgressError(undefined)
                      setGenerationCancelled(false)
                      setGeneratingCopy(true)
                      
                      // Create steps for each platform
                      const platformSteps: GenerationStep[] = platformPlans.map((plan, index) => ({
                        id: `platform-${plan.platform}`,
                        label: `Generating copy for ${PLATFORM_LABELS[plan.platform]}`,
                        status: 'pending' as const,
                      }))
                      
                      setProgressSteps([
                        { id: 'init', label: 'Initializing AI...', status: 'pending' },
                        ...platformSteps,
                        { id: 'complete', label: 'Updating platform plans...', status: 'pending' },
                      ])
                      setOverallProgress(0)

                      try {
                        console.log('[Client] ===== STARTING COPY GENERATION =====')
                        console.log('[Client] Release ID:', release.id)
                        console.log('[Client] Platform plans:', platformPlans.length)
                        
                        // Step 1: Initialize
                        updateStep('init', 'in_progress', 'Connecting to OpenAI...', 'Checking API key and initializing...', 0)
                        setOverallProgress(5)
                        await new Promise(resolve => setTimeout(resolve, 500))

                        updateStep('init', 'completed', 'AI ready')
                        setOverallProgress(10)

                        // Step 2: Generate copy for each platform
                        updateStep('init', 'completed', 'AI ready')
                        
                        // Update progress for each platform (simulated, actual generation happens on server)
                        let completedPlatforms = 0
                        for (const plan of platformPlans) {
                          const stepId = `platform-${plan.platform}`
                          updateStep(stepId, 'in_progress', `Generating ${PLATFORM_LABELS[plan.platform]} copy...`, 'Connecting to OpenAI API and creating content...', 20 + (completedPlatforms * 10))
                          setOverallProgress(10 + (completedPlatforms / platformPlans.length) * 50)
                          await new Promise(resolve => setTimeout(resolve, 1000))
                        }

                        // Make API call
                        const apiUrl = `/api/admin/releases/${release.id}/generate-copy`
                        console.log('[Client] Making API call to:', apiUrl)
                        updateStep(platformPlans[0]?.platform ? `platform-${platformPlans[0].platform}` : 'init', 'in_progress', 'Calling API...', 'Sending request to server...', 60)
                        setOverallProgress(60)
                        
                        console.log('[Client] Fetch starting...')
                        const fetchStartTime = Date.now()
                        const response = await fetch(apiUrl, {
                          method: 'POST',
                        })
                        const fetchDuration = Date.now() - fetchStartTime
                        console.log('[Client] Fetch completed in', fetchDuration, 'ms')
                        console.log('[Client] Response status:', response.status)
                        console.log('[Client] Response OK:', response.ok)
                        console.log('[Client] Response headers:', Object.fromEntries(response.headers.entries()))
                        
                        let result
                        try {
                          const text = await response.text()
                          console.log('[Client] Response text (first 500 chars):', text.substring(0, 500))
                          result = JSON.parse(text)
                          console.log('[Client] Parsed JSON result:', result)
                        } catch (parseError: any) {
                          console.error('[Client] Failed to parse response as JSON:', parseError)
                          console.error('[Client] Response text:', text)
                          throw new Error(`Failed to parse API response: ${parseError.message}`)
                        }
                        
                        console.log('[Client] ===== API RESPONSE =====')
                        console.log('[Client] Status:', response.status, 'OK:', response.ok)
                        console.log('[Client] Result:', result)
                        console.log('[Client] Plans count:', result.plans?.length)
                        console.log('[Client] Sample plan:', result.plans?.[0])
                        console.log('[Client] Warning:', result.warning)
                        console.log('[Client] ========================')
                        
                        if (!response.ok) {
                          throw new Error(result.error || result.details || 'Failed to generate copy')
                        }

                        // Validate response has plans
                        if (!result.plans || result.plans.length === 0) {
                          throw new Error('No platform plans returned from API')
                        }

                        // Check if copy is generic (fallback was used)
                        const genericPlans: any[] = []
                        for (const plan of platformPlans) {
                          const stepId = `platform-${plan.platform}`
                          const generatedPlan = result.plans?.find((p: any) => p.id === plan.id || p.platform === plan.platform)
                          
                          if (generatedPlan) {
                            // More aggressive generic detection
                            const titleIsGeneric = generatedPlan.title === `${release.song_title}${release.city ? ` - ${release.city}` : ''}` ||
                                                 generatedPlan.title === release.song_title ||
                                                 generatedPlan.title?.toLowerCase().includes('new release')
                            
                            const descIsGeneric = generatedPlan.description?.toLowerCase().includes('new release:') ||
                                                 generatedPlan.description?.toLowerCase() === `new release: ${release.song_title.toLowerCase()}`
                            
                            const hashtagsTooFew = (generatedPlan.hashtags?.length || 0) < 5
                            
                            const isGeneric = titleIsGeneric || descIsGeneric || hashtagsTooFew
                            
                            console.log(`[Client] ${plan.platform} generic check:`, {
                              title: generatedPlan.title,
                              titleIsGeneric,
                              descIsGeneric,
                              hashtagsTooFew,
                              isGeneric,
                            })
                            
                            if (isGeneric) {
                              genericPlans.push({ platform: plan.platform, plan: generatedPlan, reason: { titleIsGeneric, descIsGeneric, hashtagsTooFew } })
                              updateStep(stepId, 'error', '⚠️ Generic copy (AI failed)', 
                                `Title: "${generatedPlan.title}"\n` +
                                `Description: "${generatedPlan.description?.substring(0, 50)}..."\n` +
                                `Hashtags: ${generatedPlan.hashtags?.length || 0}\n\n` +
                                `This is FALLBACK copy, not AI-generated!\n` +
                                `OpenAI API is not working.`)
                            } else {
                              updateStep(stepId, 'completed', `✅ Generated: "${generatedPlan.title?.substring(0, 40)}..."`, 
                                `Hashtags: ${generatedPlan.hashtags?.length || 0}\n` +
                                `Description length: ${generatedPlan.description?.length || 0} chars`)
                            }
                          } else {
                            console.error(`[Client] No plan found for ${plan.platform} in response`)
                            updateStep(stepId, 'error', '❌ No copy generated', 'Platform plan not found in API response')
                            genericPlans.push({ platform: plan.platform })
                          }
                        }
                        
                        console.log('[Client] Generic plans detected:', genericPlans.length, genericPlans.map(p => p.platform))
                        setOverallProgress(80)

                        // Step 3: Update platform plans
                        updateStep('complete', 'in_progress', 'Saving to database...', `Updated ${result.plans?.length || 0} platform plan(s)...`, 90)
                        setOverallProgress(90)
                        await new Promise(resolve => setTimeout(resolve, 500))
                        
                        if (genericPlans.length > 0) {
                          updateStep('complete', 'error', `❌ ${genericPlans.length} platform(s) have generic copy`)
                          const genericPlatforms = genericPlans.map(p => PLATFORM_LABELS[p.platform]).join(', ')
                          setProgressError(
                            `🚨 OPENAI API IS NOT WORKING!\n\n` +
                            `❌ ${genericPlans.length} platform(s) have generic fallback copy:\n${genericPlatforms}\n\n` +
                            `🔍 CHECK YOUR SERVER CONSOLE (terminal where "npm run dev" is running):\n\n` +
                            `Look for these messages:\n` +
                            `✅ [AI Copy] OpenAI initialized successfully\n` +
                            `❌ [AI Copy] OpenAI API key not configured\n` +
                            `❌ [AI Copy] Error generating copy...\n\n` +
                            `📋 COMMON FIXES:\n` +
                            `1. Restart server: Stop (Ctrl+C) and run "npm run dev" again\n` +
                            `2. Check .env.local: OPENAI_API_KEY should start with "sk-proj-"\n` +
                            `3. Verify API key: Go to https://platform.openai.com/api-keys\n` +
                            `4. Check server terminal: Look for [AI Copy] log messages`
                          )
                          console.error('[Client] ===== GENERIC CONTENT DETECTED =====')
                          console.error('[Client] Generic platforms:', genericPlatforms)
                          console.error('[Client] This means OpenAI API is not working!')
                          console.error('[Client] Check server console (terminal) for [AI Copy] logs')
                          console.error('[Client] =====================================')
                        } else {
                          updateStep('complete', 'completed', `✅ All ${result.plans?.length || 0} platform plan(s) updated with AI-generated content!`)
                          console.log('[Client] ✅ All copy is AI-generated, no generic content detected')
                        }
                        setOverallProgress(100)

                        if (result.warning) {
                          setProgressError(`${result.warning}\n\nCheck server console (terminal) for details.`)
                        }

                        // Log results for debugging
                        console.log('[Client] Generation complete:', {
                          plansUpdated: result.plans?.length || 0,
                          genericCount: genericPlans.length,
                          hasWarning: !!result.warning,
                          sampleTitle: result.plans?.[0]?.title,
                          sampleDescription: result.plans?.[0]?.description?.substring(0, 50),
                          sampleHashtags: result.plans?.[0]?.hashtags,
                          genericPlatforms: genericPlans.map(p => p.platform),
                        })

                        // Only reload if no generic content
                        if (genericPlans.length === 0 && !result.warning) {
                          setTimeout(() => {
                            window.location.reload()
                          }, 1500)
                        } else {
                          console.warn('[Client] Not reloading - generic content detected or warnings present')
                          console.warn('[Client] Generic platforms:', genericPlans.map(p => p.platform))
                        }
                      } catch (error: any) {
                        console.error('[Client] ===== COPY GENERATION ERROR =====')
                        console.error('[Client] Error type:', error?.constructor?.name)
                        console.error('[Client] Error message:', error?.message)
                        console.error('[Client] Error stack:', error?.stack)
                        console.error('[Client] Full error object:', error)
                        console.error('[Client] ===================================')
                        
                        setProgressError(
                          `❌ Error: ${error?.message || 'Unknown error'}\n\n` +
                          `Check browser console (F12) and server console (terminal) for details.`
                        )
                        
                        // Mark current step as error
                        const currentStep = progressSteps.find(s => s.status === 'in_progress')
                        if (currentStep) {
                          updateStep(currentStep.id, 'error', error?.message || 'Generation failed')
                        }
                        updateStep('complete', 'error', 'Generation failed')
                        setOverallProgress(0)
                      } finally {
                        setGeneratingCopy(false)
                        console.log('[Client] ===== COPY GENERATION FINISHED =====')
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Email Logs</h3>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Daily task emails are sent at 10:00 (Europe/Istanbul time).<br/>
                  Reminder emails are sent 2 hours before each planned post.
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/admin/releases/${release.id}`)
                    if (response.ok) {
                      const data = await response.json()
                      // Refresh email logs
                      window.location.reload()
                    }
                  } catch (error) {
                    console.error('Error refreshing email logs:', error)
                  }
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                🔄 Refresh
              </button>
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
                <div className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                  Total: {initialEmailLogs.length} email(s) sent
                </div>
                {initialEmailLogs
                  .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
                  .map((log) => {
                  const sentDate = new Date(log.sent_at)
                  const platformPlan = log.platform_plan_id 
                    ? platformPlans.find(p => p.id === log.platform_plan_id)
                    : null

                  return (
                    <div
                      key={log.id}
                      className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 text-xs rounded font-medium ${
                              log.type === 'daily_task'
                                ? 'bg-blue-500 text-white'
                                : 'bg-purple-500 text-white'
                            }`}>
                              {log.type === 'daily_task' ? '📧 Daily Task' : '🔔 Reminder'}
                            </span>
                            {platformPlan && (
                              <span className="px-2 py-1 text-xs bg-orange-500 text-white rounded">
                                {PLATFORM_LABELS[platformPlan.platform]}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {formatDate(sentDate, 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          {log.subject && (
                            <p className="font-semibold text-white mb-1">
                              {log.subject}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            To: <span className="text-white">{log.recipient}</span>
                          </p>
                          {log.content_preview && (
                            <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1 font-medium">Preview:</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {log.content_preview}
                              </p>
                            </div>
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

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Release Analytics</h3>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Task Completion */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Task Completion</div>
                <div className="text-2xl font-bold text-white">
                  {dailyTasks.filter(t => t.completed).length} / {dailyTasks.length}
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${dailyTasks.length > 0 ? (dailyTasks.filter(t => t.completed).length / dailyTasks.length) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {dailyTasks.length > 0 ? Math.round((dailyTasks.filter(t => t.completed).length / dailyTasks.length) * 100) : 0}% complete
                </div>
              </div>

              {/* Platform Plans */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Platform Plans</div>
                <div className="text-2xl font-bold text-white">{platformPlans.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {platformPlans.filter(p => p.status === 'published').length} published
                </div>
              </div>

              {/* Emails Sent */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Emails Sent</div>
                <div className="text-2xl font-bold text-white">{initialEmailLogs.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {initialEmailLogs.filter(e => e.type === 'daily_task').length} daily, {initialEmailLogs.filter(e => e.type === 'reminder').length} reminders
                </div>
              </div>

              {/* Timeline Days */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Timeline Days</div>
                <div className="text-2xl font-bold text-white">{promotionDays.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {promotionDays.filter(d => d.day_offset < 0).length} pre-release, {promotionDays.filter(d => d.day_offset >= 0).length} post-release
                </div>
              </div>
            </div>

            {/* Task Completion by Day */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <h4 className="font-semibold text-white mb-4">Task Completion by Day</h4>
              <div className="space-y-3">
                {promotionDays.map((day) => {
                  const dayTasks = dailyTasks.filter(t => t.day_offset === day.day_offset)
                  const completed = dayTasks.filter(t => t.completed).length
                  const total = dayTasks.length
                  const percentage = total > 0 ? (completed / total) * 100 : 0
                  
                  return (
                    <div key={day.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white">
                          {day.day_offset < 0 ? `T${day.day_offset}` : day.day_offset === 0 ? 'Release Day' : `T+${day.day_offset}`} - {formatDate(new Date(day.date), 'MMM d, yyyy')}
                        </span>
                        <span className="text-sm text-gray-400">
                          {completed}/{total} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            percentage === 100 ? 'bg-green-500' :
                            percentage >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Platform Status Breakdown */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <h4 className="font-semibold text-white mb-4">Platform Status</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['scheduled', 'reminded', 'published', 'skipped'] as const).map(status => {
                  const count = platformPlans.filter(p => p.status === status).length
                  return (
                    <div key={status} className="text-center">
                      <div className="text-2xl font-bold text-white">{count}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 capitalize">{status}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Email Statistics */}
            {initialEmailLogs.length > 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <h4 className="font-semibold text-white mb-4">Email Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Daily Task Emails</div>
                    <div className="text-xl font-bold text-white">
                      {initialEmailLogs.filter(e => e.type === 'daily_task').length}
                    </div>
                    {initialEmailLogs.filter(e => e.type === 'daily_task').length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Last: {formatDate(new Date(initialEmailLogs.filter(e => e.type === 'daily_task').sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())[0]?.sent_at || ''), 'MMM d, yyyy HH:mm')}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reminder Emails</div>
                    <div className="text-xl font-bold text-white">
                      {initialEmailLogs.filter(e => e.type === 'reminder').length}
                    </div>
                    {initialEmailLogs.filter(e => e.type === 'reminder').length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Last: {formatDate(new Date(initialEmailLogs.filter(e => e.type === 'reminder').sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())[0]?.sent_at || ''), 'MMM d, yyyy HH:mm')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Deadlines */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <h4 className="font-semibold text-white mb-4">Upcoming Deadlines</h4>
              <div className="space-y-2">
                {platformPlans
                  .filter(p => p.status === 'scheduled' && new Date(p.planned_at) > new Date())
                  .sort((a, b) => new Date(a.planned_at).getTime() - new Date(b.planned_at).getTime())
                  .slice(0, 5)
                  .map(plan => {
                    const plannedDate = new Date(plan.planned_at)
                    const hoursUntil = Math.round((plannedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60))
                    return (
                      <div key={plan.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        <div>
                          <span className="text-sm font-medium text-white">{PLATFORM_LABELS[plan.platform]}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                            {formatDate(plannedDate, 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {hoursUntil > 24 ? `${Math.round(hoursUntil / 24)} days` : `${hoursUntil} hours`} away
                        </span>
                      </div>
                    )
                  })}
                {platformPlans.filter(p => p.status === 'scheduled' && new Date(p.planned_at) > new Date()).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">No upcoming deadlines</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Modal */}
      <GenerationProgressModal
        isOpen={showProgressModal}
        onClose={() => {
          setShowProgressModal(false)
          setProgressSteps([])
          setOverallProgress(0)
          setProgressError(undefined)
        }}
        onCancel={() => {
          setGenerationCancelled(true)
          setShowProgressModal(false)
          setProgressSteps([])
          setOverallProgress(0)
          setProgressError(undefined)
        }}
        title="AI Generation Progress"
        steps={progressSteps}
        overallProgress={overallProgress}
        error={progressError}
      />
    </div>
  )
}
