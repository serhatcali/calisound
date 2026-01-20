'use client'

import Link from 'next/link'
import { SocialPost, SocialJob } from '@/types/social-media'
import { format } from 'date-fns'
import { useState } from 'react'

interface SocialPostDetailProps {
  post: SocialPost
  jobs: SocialJob[]
}

const PLATFORM_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  youtube_shorts: 'YouTube Shorts',
  instagram: 'Instagram Feed',
  instagram_story: 'Instagram Story',
  tiktok: 'TikTok',
  twitter: 'X (Twitter)',
  facebook: 'Facebook',
}

const PLATFORM_ICONS: Record<string, string> = {
  youtube: '▶️',
  youtube_shorts: '📱',
  instagram: '📷',
  instagram_story: '📸',
  tiktok: '🎵',
  twitter: '🐦',
  facebook: '👥',
}

export function SocialPostDetail({ post, jobs }: SocialPostDetailProps) {
  const [publishing, setPublishing] = useState(false)
  const [retrying, setRetrying] = useState(false)

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500',
    review: 'bg-yellow-500',
    approved: 'bg-blue-500',
    scheduled: 'bg-purple-500',
    publishing: 'bg-orange-500',
    published: 'bg-green-500',
    failed: 'bg-red-500',
  }

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    review: 'Review',
    approved: 'Approved',
    scheduled: 'Scheduled',
    publishing: 'Publishing',
    published: 'Published',
    failed: 'Failed',
  }

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'running': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      case 'failed': return 'bg-red-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const handlePublish = async () => {
    if (!confirm('Publish this post now? This will attempt to publish to all platforms with content.')) {
      return
    }

    setPublishing(true)
    try {
      const response = await fetch(`/api/admin/social/posts/${post.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to publish post')
      }

      const result = await response.json()
      alert(`Publish job started! ${result.message || 'Check the Publishing page for status.'}`)
      window.location.reload()
    } catch (error: any) {
      console.error('Error publishing post:', error)
      alert(`Error: ${error.message || 'Failed to publish post'}`)
    } finally {
      setPublishing(false)
    }
  }

  const handleRetry = async () => {
    if (!confirm('Retry publishing this post? This will create new jobs for all platforms.')) {
      return
    }

    setRetrying(true)
    try {
      const response = await fetch(`/api/admin/social/posts/${post.id}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to retry post')
      }

      const result = await response.json()
      alert(`Retry initiated! ${result.message || 'Check the Publishing page for status.'}`)
      window.location.reload()
    } catch (error: any) {
      console.error('Error retrying post:', error)
      alert(`Error: ${error.message || 'Failed to retry post'}`)
    } finally {
      setRetrying(false)
    }
  }

  const hasContent = post.variants && post.variants.some(
    v => v.caption || v.description || v.title
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {post.title}
            </h1>
            <span
              className={`px-3 py-1 text-sm font-medium text-white rounded ${statusColors[post.status] || 'bg-gray-500'}`}
            >
              {statusLabels[post.status] || post.status}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Post Details & Management
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/social/posts"
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ← Back
          </Link>
          <Link
            href={`/admin/social/compose?id=${post.id}`}
            className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Post Info */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Post Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Base Text</p>
            <p className="text-gray-900 dark:text-white">{post.base_text}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">City</p>
            <p className="text-gray-900 dark:text-white">
              {post.city ? post.city.name : 'None'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Campaign</p>
            <p className="text-gray-900 dark:text-white">
              {post.campaign ? post.campaign.name : 'None'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Timezone</p>
            <p className="text-gray-900 dark:text-white">{post.timezone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created</p>
            <p className="text-gray-900 dark:text-white">
              {format(new Date(post.created_at), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Updated</p>
            <p className="text-gray-900 dark:text-white">
              {format(new Date(post.updated_at), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
          {post.scheduled_at && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Scheduled</p>
              <p className="text-gray-900 dark:text-white">
                {format(new Date(post.scheduled_at), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
          )}
          {post.error_last && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Error</p>
              <p className="text-red-600 dark:text-red-400">{post.error_last}</p>
            </div>
          )}
        </div>
      </div>

      {/* Variants */}
      {post.variants && post.variants.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Platform Variants ({post.variants.length})
          </h2>
          <div className="space-y-4">
            {post.variants.map((variant) => (
              <div
                key={variant.id}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">
                    {PLATFORM_ICONS[variant.platform] || '📱'}
                  </span>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {PLATFORM_LABELS[variant.platform] || variant.platform}
                  </h3>
                </div>
                {variant.title && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Title</p>
                    <p className="text-sm text-gray-900 dark:text-white">{variant.title}</p>
                  </div>
                )}
                {variant.caption && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Caption</p>
                    <p className="text-sm text-gray-900 dark:text-white">{variant.caption}</p>
                  </div>
                )}
                {variant.description && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {variant.description}
                    </p>
                  </div>
                )}
                {variant.hashtags && variant.hashtags.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Hashtags</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {variant.hashtags.join(' ')}
                    </p>
                  </div>
                )}
                {variant.tags && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tags</p>
                    <p className="text-sm text-gray-900 dark:text-white">{variant.tags}</p>
                  </div>
                )}
                {variant.first_comment && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">First Comment</p>
                    <p className="text-sm text-gray-900 dark:text-white">{variant.first_comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jobs */}
      {jobs.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Publishing Jobs ({jobs.length})
          </h2>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {PLATFORM_LABELS[job.platform] || job.platform} - {job.step}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium text-white rounded ${getJobStatusColor(job.status)}`}
                      >
                        {job.status}
                      </span>
                    </div>
                    {job.last_error && (
                      <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                        Error: {job.last_error}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Attempts: {job.attempts}</span>
                      {job.next_retry_at && (
                        <span>
                          Retry: {format(new Date(job.next_retry_at), 'MMM d, yyyy HH:mm')}
                        </span>
                      )}
                      <span>
                        Created: {format(new Date(job.created_at), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                  {job.status === 'failed' && (
                    <Link
                      href={`/admin/social/publishing`}
                      className="ml-4 px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Retry
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Published URLs */}
      {post.published_urls && Object.keys(post.published_urls).length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Published Links
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(post.published_urls).map(([platform, url]) => (
              <a
                key={platform}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                {PLATFORM_LABELS[platform] || platform} →
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {post.status === 'draft' && hasContent && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {publishing ? 'Publishing...' : 'Publish Now'}
            </button>
          )}
          {post.status === 'failed' && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {retrying ? 'Retrying...' : 'Retry Publishing'}
            </button>
          )}
          <Link
            href={`/admin/social/publishing`}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Publishing Status
          </Link>
        </div>
      </div>
    </div>
  )
}
