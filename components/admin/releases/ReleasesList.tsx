'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Release } from '@/types/release-planning'
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
  return date.toLocaleString('en-US')
}

interface ReleasesListProps {
  releases: Release[]
}

export function ReleasesList({ releases }: ReleasesListProps) {
  const [filter, setFilter] = useState<'all' | 'draft' | 'planning' | 'active' | 'completed'>('all')

  const filteredReleases = filter === 'all'
    ? releases
    : releases.filter(r => r.status === filter)

  const getStatusColor = (status: Release['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500'
      case 'planning': return 'bg-blue-500'
      case 'active': return 'bg-green-500'
      case 'completed': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">
            Release Planning
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-Assisted Release Planner - Manage your song releases
          </p>
        </div>
        <Link
          href="/admin/releases/new"
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
        >
          + New Release
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {(['all', 'draft', 'planning', 'active', 'completed'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === status
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({status === 'all' ? releases.length : releases.filter(r => r.status === status).length})
          </button>
        ))}
      </div>

      {/* Releases Grid */}
      {filteredReleases.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No releases found</p>
          <Link
            href="/admin/releases/new"
            className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Create Your First Release
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReleases.map((release) => {
            const releaseDate = new Date(release.release_at)
            const now = new Date()
            const daysUntilRelease = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            
            return (
              <Link
                key={release.id}
                href={`/admin/releases/${release.id}`}
                className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {release.song_title}
                    </h3>
                    {(release.city || release.country) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {release.city && release.country ? `${release.city}, ${release.country}` : release.city || release.country}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {release.local_language} {release.include_english && '+ English'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getStatusColor(release.status)}`}>
                    {release.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Release Date:</span>
                    <span className="text-white font-medium">
                      {formatDate(releaseDate, 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Days Until:</span>
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
                  {release.fast_mode && (
                    <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-lg text-xs font-medium">
                      ⚡ Fast Mode (T-3 to T+3)
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
