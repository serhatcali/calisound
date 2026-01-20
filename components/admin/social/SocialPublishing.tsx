'use client'

import Link from 'next/link'
import { SocialPost, SocialJob } from '@/types/social-media'
import { format } from 'date-fns'
import { useState } from 'react'

interface SocialPublishingProps {
  published: SocialPost[]
  failed: SocialPost[]
  publishing: SocialPost[]
  jobs: SocialJob[]
}

export function SocialPublishing({
  published,
  failed,
  publishing,
  jobs
}: SocialPublishingProps) {
  const [activeTab, setActiveTab] = useState<'published' | 'failed' | 'publishing' | 'jobs'>('published')
  const [retryingPost, setRetryingPost] = useState<string | null>(null)
  const [retryingJob, setRetryingJob] = useState<string | null>(null)

  const getJobForPost = (postId: string) => {
    return jobs.filter(job => job.post_id === postId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'running': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      case 'failed': return 'bg-red-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const handleRetryPost = async (postId: string) => {
    if (!confirm('Retry publishing this post? This will create new jobs for all platforms.')) {
      return
    }

    setRetryingPost(postId)
    try {
      const response = await fetch(`/api/admin/social/posts/${postId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to retry post')
      }

      const result = await response.json()
      alert(`Retry initiated! ${result.message || 'Check the Publishing tab for status.'}`)
      
      // Refresh page to show updated status
      window.location.reload()
    } catch (error: any) {
      console.error('Error retrying post:', error)
      alert(`Error: ${error.message || 'Failed to retry post'}`)
    } finally {
      setRetryingPost(null)
    }
  }

  const handleRetryJob = async (jobId: string) => {
    if (!confirm('Retry this job?')) {
      return
    }

    setRetryingJob(jobId)
    try {
      const response = await fetch(`/api/admin/social/jobs/${jobId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to retry job')
      }

      const result = await response.json()
      alert(`Job retry initiated! ${result.message || 'Check the Jobs tab for status.'}`)
      
      // Refresh page to show updated status
      window.location.reload()
    } catch (error: any) {
      console.error('Error retrying job:', error)
      alert(`Error: ${error.message || 'Failed to retry job'}`)
    } finally {
      setRetryingJob(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{published.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{failed.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Publishing</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{publishing.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {jobs.filter(j => j.status === 'running' || j.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {[
            { key: 'published', label: 'Published', count: published.length },
            { key: 'failed', label: 'Failed', count: failed.length },
            { key: 'publishing', label: 'Publishing', count: publishing.length },
            { key: 'jobs', label: 'Jobs', count: jobs.length },
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
          {/* Published Posts */}
          {activeTab === 'published' && (
            <div className="space-y-4">
              {published.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">No published posts</p>
              ) : (
                published.map(post => (
                  <div
                    key={post.id}
                    className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{post.title}</h4>
                          <span className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded">
                            Published
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {post.base_text}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          {post.published_urls && Object.keys(post.published_urls).length > 0 && (
                            <span>Platforms: {Object.keys(post.published_urls).length}</span>
                          )}
                          {post.updated_at && (
                            <span>Published: {format(new Date(post.updated_at), 'MMM d, yyyy HH:mm')}</span>
                          )}
                        </div>
                        {post.published_urls && Object.keys(post.published_urls).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(post.published_urls).map(([platform, url]) => (
                              <a
                                key={platform}
                                href={url as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                {platform} →
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/admin/social/compose?id=${post.id}`}
                        className="ml-4 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Failed Posts */}
          {activeTab === 'failed' && (
            <div className="space-y-4">
              {failed.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">No failed posts</p>
              ) : (
                failed.map(post => (
                  <div
                    key={post.id}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{post.title}</h4>
                          <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded">
                            Failed
                          </span>
                        </div>
                        {post.error_last && (
                          <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                            Error: {post.error_last}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {post.base_text}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          {post.updated_at && (
                            <span>Failed: {format(new Date(post.updated_at), 'MMM d, yyyy HH:mm')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleRetryPost(post.id)}
                          disabled={retryingPost === post.id}
                          className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {retryingPost === post.id ? 'Retrying...' : 'Retry'}
                        </button>
                        <Link
                          href={`/admin/social/compose?id=${post.id}`}
                          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Publishing Posts */}
          {activeTab === 'publishing' && (
            <div className="space-y-4">
              {publishing.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">No posts currently publishing</p>
              ) : (
                publishing.map(post => (
                  <div
                    key={post.id}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{post.title}</h4>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded animate-pulse">
                            Publishing...
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {post.base_text}
                        </p>
                        {getJobForPost(post.id).length > 0 && (
                          <div className="mt-2 space-y-1">
                            {getJobForPost(post.id).map(job => (
                              <div key={job.id} className="text-xs text-gray-600 dark:text-gray-400">
                                {job.platform}: {job.step} - <span className={getStatusColor(job.status)}>{job.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/admin/social/compose?id=${post.id}`}
                        className="ml-4 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Jobs */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">No jobs</p>
              ) : (
                jobs.map(job => (
                  <div
                    key={job.id}
                    className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {job.platform} - {job.step}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                        {job.last_error && (
                          <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                            Error: {job.last_error}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Post ID: {job.post_id.substring(0, 8)}...</span>
                          <span>Attempts: {job.attempts}</span>
                          {job.next_retry_at && (
                            <span>Retry: {format(new Date(job.next_retry_at), 'MMM d, yyyy HH:mm')}</span>
                          )}
                          <span>Created: {format(new Date(job.created_at), 'MMM d, yyyy HH:mm')}</span>
                        </div>
                      </div>
                      {job.status === 'failed' && (
                        <button
                          onClick={() => handleRetryJob(job.id)}
                          disabled={retryingJob === job.id}
                          className="ml-4 px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {retryingJob === job.id ? 'Retrying...' : 'Retry'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
