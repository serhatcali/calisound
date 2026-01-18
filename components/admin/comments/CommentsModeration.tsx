'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Comment {
  id: string
  entity_type: string
  entity_id: string
  entity_name?: string
  author_name: string
  author_email?: string
  content: string
  rating?: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export function CommentsModeration() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => {
    loadComments()
  }, [filter])

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/admin/comments?status=${filter === 'all' ? '' : filter}`)
      const data = await response.json()
      if (data.success) {
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCommentStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()
      if (data.success) {
        await loadComments()
      }
    } catch (error) {
      console.error('Error updating comment:', error)
      alert('Error updating comment')
    }
  }

  const deleteComment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        await loadComments()
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Error deleting comment')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
              filter === status
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
            }`}
          >
            {status} ({comments.filter(c => filter === 'all' || c.status === status).length})
          </button>
        ))}
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No comments found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold capitalize ${
                      comment.status === 'approved'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : comment.status === 'rejected'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {comment.status}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                      {comment.entity_type}
                    </span>
                    {comment.entity_name && (
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {comment.entity_name}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    {comment.author_name}
                    {comment.author_email && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        ({comment.author_email})
                      </span>
                    )}
                  </p>
                  {comment.rating && (
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <span
                          key={rating}
                          className={rating <= comment.rating! ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-700'}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(comment.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {comment.status === 'pending' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateCommentStatus(comment.id, 'approved')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateCommentStatus(comment.id, 'rejected')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </motion.button>
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => deleteComment(comment.id)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
