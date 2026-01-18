'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ScheduledPost {
  id: string
  entity_type: 'city' | 'set'
  entity_id: string
  entity_name: string
  scheduled_date: string
  action: 'publish' | 'unpublish'
  status: 'pending' | 'completed' | 'failed'
}

export function ScheduledPosts() {
  const [scheduled, setScheduled] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadScheduled()
    // Check for scheduled posts every minute
    const interval = setInterval(checkScheduledPosts, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadScheduled = async () => {
    try {
      const response = await fetch('/api/admin/scheduled')
      const data = await response.json()
      if (data.success) {
        setScheduled(data.posts || [])
      }
    } catch (error) {
      console.error('Error loading scheduled posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkScheduledPosts = async () => {
    try {
      await fetch('/api/admin/scheduled/check', { method: 'POST' })
      await loadScheduled()
    } catch (error) {
      console.error('Error checking scheduled posts:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
          Scheduled Posts
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Posts with release dates will automatically change status from SOON to OUT_NOW when the scheduled date arrives.
          The system checks for scheduled posts every minute.
        </p>
      </div>

      {/* Scheduled List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading scheduled posts...</p>
        </div>
      ) : scheduled.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No scheduled posts found.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Cities with release_datetime will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {scheduled.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(post.status)}`} />
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                      {post.entity_type}
                    </span>
                    <span className="text-gray-900 dark:text-white font-bold">
                      {post.entity_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Scheduled: {formatDate(post.scheduled_date)}</span>
                    <span>•</span>
                    <span className="capitalize">Status: {post.status}</span>
                    <span>•</span>
                    <span className="capitalize">Action: {post.action}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
