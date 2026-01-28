'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SocialPost } from '@/types/social-media'
import { format } from 'date-fns'

export function SocialReview() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/admin/social/posts?status=review')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (postId: string) => {
    if (!confirm('Approve this post? It will be marked as approved and can be scheduled or published.')) {
      return
    }

    setProcessing(postId)
    try {
      const response = await fetch(`/api/admin/social/posts/${postId}/approve`, {
        method: 'POST',
      })

      if (response.ok) {
        await loadPosts()
        alert('Post approved successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to approve post'}`)
      }
    } catch (error: any) {
      console.error('Error approving post:', error)
      alert(`Error: ${error.message || 'Failed to approve post'}`)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (postId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):')
    if (reason === null) return // User cancelled

    setProcessing(postId)
    try {
      const response = await fetch(`/api/admin/social/posts/${postId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || undefined }),
      })

      if (response.ok) {
        await loadPosts()
        alert('Post rejected and moved back to draft.')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to reject post'}`)
      }
    } catch (error: any) {
      console.error('Error rejecting post:', error)
      alert(`Error: ${error.message || 'Failed to reject post'}`)
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No posts pending review</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
          Posts submitted for review will appear here
        </p>
        <Link
          href="/admin/social/posts"
          className="inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          View All Posts
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Posts Pending Review ({posts.length})
            </h2>
            <button
              onClick={loadPosts}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {post.title}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-500 text-white rounded whitespace-nowrap">
                      Review
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {post.base_text}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {post.city && (
                      <span>📍 {post.city.name}</span>
                    )}
                    {post.campaign && (
                      <span>📋 {post.campaign.name}</span>
                    )}
                    <span>📅 {format(new Date(post.created_at), 'MMM d, yyyy HH:mm')}</span>
                    {post.variants && post.variants.length > 0 && (
                      <span>📱 {post.variants.length} platform{post.variants.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>

                  <div className="mt-3">
                    <Link
                      href={`/admin/social/posts/${post.id}`}
                      className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(post.id)}
                    disabled={processing === post.id}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {processing === post.id ? 'Processing...' : '✓ Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(post.id)}
                    disabled={processing === post.id}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
