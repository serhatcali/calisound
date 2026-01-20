'use client'

import Link from 'next/link'
import { SocialPost } from '@/types/social-media'
import { format, isToday, isTomorrow, isPast } from 'date-fns'

interface SocialSchedulerProps {
  posts: SocialPost[]
}

export function SocialScheduler({ posts }: SocialSchedulerProps) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Group posts by date
  const postsByDate = posts.reduce((acc, post) => {
    if (!post.scheduled_at) return acc
    const date = new Date(post.scheduled_at)
    date.setHours(0, 0, 0, 0)
    const dateKey = date.toISOString()
    
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(post)
    return acc
  }, {} as Record<string, SocialPost[]>)

  const sortedDates = Object.keys(postsByDate).sort()

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEEE, MMM d, yyyy')
  }

  const getTimeLabel = (dateStr: string) => {
    return format(new Date(dateStr), 'HH:mm')
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Scheduled</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{posts.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {posts.filter(p => p.scheduled_at && isToday(new Date(p.scheduled_at))).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {posts.filter(p => {
              if (!p.scheduled_at) return false
              const postDate = new Date(p.scheduled_at)
              const weekStart = new Date(today)
              weekStart.setDate(weekStart.getDate() - weekStart.getDay())
              const weekEnd = new Date(weekStart)
              weekEnd.setDate(weekEnd.getDate() + 7)
              return postDate >= weekStart && postDate < weekEnd
            }).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {posts.filter(p => p.scheduled_at && isPast(new Date(p.scheduled_at)) && p.status !== 'published').length}
          </p>
        </div>
      </div>

      {/* Scheduled Posts List */}
      {sortedDates.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No scheduled posts</p>
          <Link
            href="/admin/social/compose"
            className="inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Create Scheduled Post
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const datePosts = postsByDate[dateKey]
            const date = new Date(dateKey)
            const isOverdue = isPast(date) && !isToday(date)

            return (
              <div
                key={dateKey}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                <div className={`p-4 border-b border-gray-200 dark:border-gray-800 ${
                  isOverdue ? 'bg-red-50 dark:bg-red-900/20' : ''
                }`}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getDateLabel(dateKey)}
                    {isOverdue && (
                      <span className="ml-2 text-sm text-red-600 dark:text-red-400">(Overdue)</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {datePosts.length} post{datePosts.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {datePosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {post.title}
                            </h4>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded">
                              {post.status}
                            </span>
                            {post.scheduled_at && (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {getTimeLabel(post.scheduled_at)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {post.base_text}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {post.city && <span>City: {post.city.name}</span>}
                            {post.variants && post.variants.length > 0 && (
                              <span>Platforms: {post.variants.length}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Link
                            href={`/admin/social/compose?id=${post.id}`}
                            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
