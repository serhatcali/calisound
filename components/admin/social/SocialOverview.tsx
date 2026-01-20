'use client'

import Link from 'next/link'
import { SocialPost } from '@/types/social-media'
import { format } from 'date-fns'

interface SocialOverviewProps {
  drafts: SocialPost[]
  todayScheduled: SocialPost[]
  thisWeekScheduled: SocialPost[]
  published: SocialPost[]
  failed: SocialPost[]
}

export function SocialOverview({
  drafts,
  todayScheduled,
  thisWeekScheduled,
  published,
  failed
}: SocialOverviewProps) {
  const stats = [
    { label: 'Drafts', value: drafts.length, color: 'bg-gray-500', href: '/admin/social/compose' },
    { label: 'Today Scheduled', value: todayScheduled.length, color: 'bg-blue-500', href: '/admin/social/schedule' },
    { label: 'This Week', value: thisWeekScheduled.length, color: 'bg-purple-500', href: '/admin/social/schedule' },
    { label: 'Published', value: published.length, color: 'bg-green-500', href: '/admin/social/publishing' },
    { label: 'Failed', value: failed.length, color: 'bg-red-500', href: '/admin/social/publishing' }
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} opacity-20`} />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/social/compose"
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200 dark:border-orange-800 rounded-xl hover:shadow-lg transition-all"
          >
            <span className="text-2xl">✏️</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Create New Post</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Compose multi-platform post</p>
            </div>
          </Link>
          <Link
            href="/admin/social/library"
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800 rounded-xl hover:shadow-lg transition-all"
          >
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Content Library</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage assets & templates</p>
            </div>
          </Link>
          <Link
            href="/admin/social/integrations"
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 dark:border-green-800 rounded-xl hover:shadow-lg transition-all"
          >
            <span className="text-2xl">🔌</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Integrations</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Connect social accounts</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Today's Schedule */}
      {todayScheduled.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today&apos;s Schedule</h2>
            <Link
              href="/admin/social/schedule"
              className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {todayScheduled.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{post.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {post.scheduled_at && format(new Date(post.scheduled_at), 'HH:mm')}
                    {post.city && ` • ${post.city.name}`}
                  </p>
                </div>
                <Link
                  href={`/admin/social/compose?id=${post.id}`}
                  className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Drafts */}
      {drafts.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Drafts</h2>
            <Link
              href="/admin/social/compose"
              className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {drafts.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{post.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(post.created_at), 'MMM d, yyyy')}
                    {post.city && ` • ${post.city.name}`}
                  </p>
                </div>
                <Link
                  href={`/admin/social/compose?id=${post.id}`}
                  className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
                >
                  Continue
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
