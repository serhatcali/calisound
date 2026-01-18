'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ActivityLog {
  id: string
  user_id: string
  action: 'create' | 'update' | 'delete'
  entity_type: string
  entity_id: string
  entity_name?: string
  changes?: Record<string, any>
  created_at: string
}

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadLogs()
  }, [filter])

  const loadLogs = async () => {
    try {
      const response = await fetch(`/api/admin/activity-logs?limit=100`)
      const data = await response.json()
      if (data.success) {
        let filteredLogs = data.logs || []
        if (filter !== 'all') {
          filteredLogs = filteredLogs.filter((log: ActivityLog) => log.entity_type === filter)
        }
        setLogs(filteredLogs)
      }
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-500'
      case 'update':
        return 'bg-blue-500'
      case 'delete':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatChanges = (changes: Record<string, any> | undefined) => {
    if (!changes) return null
    return Object.entries(changes)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ')
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
              : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('city')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'city'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
              : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
          }`}
        >
          Cities
        </button>
        <button
          onClick={() => setFilter('set')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'set'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
              : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
          }`}
        >
          Sets
        </button>
        <button
          onClick={() => setFilter('link')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'link'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
              : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
          }`}
        >
          Links
        </button>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No activity logs found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full ${getActionColor(log.action)} mt-2`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                      {log.action}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                      {log.entity_type}
                    </span>
                    {log.entity_name && (
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {log.entity_name}
                      </span>
                    )}
                  </div>
                  {log.changes && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {formatChanges(log.changes)}
                      </p>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>User: {log.user_id}</span>
                    <span>•</span>
                    <span>{formatDate(log.created_at)}</span>
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
