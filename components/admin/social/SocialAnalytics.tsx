'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'

interface AnalyticsOverview {
  posts: {
    total: number
    published: number
    draft: number
    failed: number
    scheduled: number
    platformsPublished: number
  }
  jobs: {
    total: number
    completed: number
    failed: number
    pending: number
  }
  metrics: {
    views: number
    likes: number
    comments: number
    shares: number
    clicks: number
  }
}

interface PlatformPerformance {
  platform: string
  posts: number
  published: number
  failed: number
  views: number
  likes: number
  comments: number
  shares: number
  clicks: number
}

interface TopPost {
  id: string
  title: string
  base_text: string
  status: string
  published_urls: Record<string, string>
  created_at: string
  updated_at: string
  city?: { name: string; slug: string }
  campaign?: { name: string }
}

interface DailyMetric {
  date: string
  views: number
  likes: number
  comments: number
  shares: number
  clicks: number
}

interface TopCity {
  name: string
  slug: string
  count: number
}

export function SocialAnalytics() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [platforms, setPlatforms] = useState<PlatformPerformance[]>([])
  const [topPosts, setTopPosts] = useState<TopPost[]>([])
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([])
  const [topCities, setTopCities] = useState<TopCity[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<number>(30)

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [overviewRes, platformsRes, topPostsRes, dailyRes, citiesRes] = await Promise.all([
        fetch('/api/admin/social/analytics/overview'),
        fetch(`/api/admin/social/analytics/platforms?days=${timeRange}`),
        fetch('/api/admin/social/analytics/top-posts?limit=10'),
        fetch(`/api/admin/social/analytics/daily?days=${timeRange}`),
        fetch('/api/admin/social/analytics/top-cities?limit=10'),
      ])

      if (overviewRes.ok) {
        const data = await overviewRes.json()
        setOverview(data)
      }

      if (platformsRes.ok) {
        const data = await platformsRes.json()
        setPlatforms(data)
      }

      if (topPostsRes.ok) {
        const data = await topPostsRes.json()
        setTopPosts(data)
      }

      if (dailyRes.ok) {
        const data = await dailyRes.json()
        setDailyMetrics(data)
      }

      if (citiesRes.ok) {
        const data = await citiesRes.json()
        setTopCities(data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!overview || !platforms || !topPosts) return

    // Create CSV content
    let csv = 'Social Media Analytics Export\n\n'
    csv += 'Overview\n'
    csv += `Total Posts,${overview.posts.total}\n`
    csv += `Published,${overview.posts.published}\n`
    csv += `Draft,${overview.posts.draft}\n`
    csv += `Failed,${overview.posts.failed}\n`
    csv += `Scheduled,${overview.posts.scheduled}\n\n`

    csv += 'Platform Performance\n'
    csv += 'Platform,Posts,Published,Failed,Views,Likes,Comments,Shares,Clicks\n'
    platforms.forEach(p => {
      csv += `${p.platform},${p.posts},${p.published},${p.failed},${p.views},${p.likes},${p.comments},${p.shares},${p.clicks}\n`
    })

    csv += '\nTop Posts\n'
    csv += 'Title,City,Campaign,Published Date\n'
    topPosts.forEach(post => {
      const cityName = post.city?.name || 'N/A'
      const campaignName = post.campaign?.name || 'N/A'
      const publishedDate = format(new Date(post.updated_at), 'yyyy-MM-dd')
      csv += `"${post.title}","${cityName}","${campaignName}","${publishedDate}"\n`
    })

    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `social-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[7, 30, 90, 365].map(days => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === days
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {days === 7 ? '7 Days' : days === 30 ? '30 Days' : days === 90 ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
        <button
          onClick={exportToCSV}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{overview.posts.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {overview.posts.published} published
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {overview.metrics.views.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {overview.metrics.likes.toLocaleString()} likes
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Engagements</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {(overview.metrics.likes + overview.metrics.comments + overview.metrics.shares).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {overview.metrics.comments} comments, {overview.metrics.shares} shares
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Platforms Active</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
              {overview.posts.platformsPublished}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {overview.jobs.completed} jobs completed
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Platform Performance
          </h2>
          {platforms.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">No platform data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-700 dark:text-gray-300">Platform</th>
                    <th className="text-right py-2 text-gray-700 dark:text-gray-300">Posts</th>
                    <th className="text-right py-2 text-gray-700 dark:text-gray-300">Views</th>
                    <th className="text-right py-2 text-gray-700 dark:text-gray-300">Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {platforms.map((platform) => (
                    <tr key={platform.platform} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 font-medium text-gray-900 dark:text-white">
                        {platform.platform}
                      </td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                        {platform.published}/{platform.posts}
                      </td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                        {platform.views.toLocaleString()}
                      </td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                        {(platform.likes + platform.comments + platform.shares).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Cities */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Top Cities
          </h2>
          {topCities.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">No city data available</p>
          ) : (
            <div className="space-y-3">
              {topCities.map((city, index) => (
                <div
                  key={city.slug}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400 w-6">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{city.name}</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">{city.count} posts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Posts */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Top Performing Posts
        </h2>
        {topPosts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">No published posts yet</p>
        ) : (
          <div className="space-y-3">
            {topPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{post.title}</h3>
                      {post.city && (
                        <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded">
                          {post.city.name}
                        </span>
                      )}
                      {post.campaign && (
                        <span className="px-2 py-1 text-xs bg-purple-500 text-white rounded">
                          {post.campaign.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {post.base_text}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        Published: {format(new Date(post.updated_at), 'MMM d, yyyy')}
                      </span>
                      {post.published_urls && Object.keys(post.published_urls).length > 0 && (
                        <span>Platforms: {Object.keys(post.published_urls).length}</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/admin/social/posts/${post.id}`}
                    className="ml-4 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Metrics Chart (Simple Bar Chart) */}
      {dailyMetrics.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Daily Metrics ({timeRange} days)
          </h2>
          <div className="space-y-2">
            {dailyMetrics.slice(-14).map((metric) => {
              const maxValue = Math.max(metric.views, metric.likes, metric.comments, metric.shares, metric.clicks)
              return (
                <div key={metric.date} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{format(new Date(metric.date), 'MMM d')}</span>
                    <span>Views: {metric.views.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{ width: `${(metric.views / Math.max(maxValue, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
