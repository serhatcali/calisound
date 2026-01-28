'use client'

import { City, Set, GlobalLinks } from '@/types/database'
import { SocialPost, SocialAccount } from '@/types/social-media'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
// Safe date formatting - using native JavaScript only
function formatDate(date: Date, formatStr: string): string {
  if (formatStr === 'HH:mm:ss') {
    return date.toLocaleTimeString('en-US', { hour12: false })
  }
  if (formatStr === 'EEEE, MMM d, yyyy') {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
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

interface AdminDashboardProps {
  cities: City[]
  sets: Set[]
  links: GlobalLinks | null
  socialPosts: SocialPost[]
  socialAccounts: SocialAccount[]
}

export function AdminDashboard({
  cities,
  sets,
  links,
  socialPosts,
  socialAccounts,
}: AdminDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Social Media Stats
  const draftPosts = socialPosts.filter(p => p.status === 'draft').length
  const scheduledPosts = socialPosts.filter(p => p.status === 'scheduled').length
  const publishedPosts = socialPosts.filter(p => p.status === 'published').length
  const reviewPosts = socialPosts.filter(p => p.status === 'review').length
  const connectedAccounts = socialAccounts.filter(a => a.status === 'connected').length

  const stats = [
    {
      label: 'Social Posts',
      value: socialPosts.length,
      icon: '📱',
      color: 'from-orange-500 to-amber-500',
      href: '/admin/social/posts',
      subLabel: `${publishedPosts} published`,
    },
    {
      label: 'Scheduled',
      value: scheduledPosts,
      icon: '📅',
      color: 'from-blue-500 to-cyan-500',
      href: '/admin/social/schedule',
      subLabel: 'Upcoming posts',
    },
    {
      label: 'Pending Review',
      value: reviewPosts,
      icon: '👁️',
      color: 'from-yellow-500 to-orange-500',
      href: '/admin/social/review',
      subLabel: 'Awaiting approval',
    },
    {
      label: 'Connected Accounts',
      value: connectedAccounts,
      icon: '🔗',
      color: 'from-green-500 to-emerald-500',
      href: '/admin/social/integrations',
      subLabel: `${socialAccounts.length} total`,
    },
    {
      label: 'Total Cities',
      value: cities.length,
      icon: '🏙️',
      color: 'from-purple-500 to-pink-500',
      href: '/admin/cities',
      subLabel: `${cities.filter(c => c.status === 'OUT_NOW').length} published`,
    },
    {
      label: 'Total Sets',
      value: sets.length,
      icon: '🎵',
      color: 'from-indigo-500 to-purple-500',
      href: '/admin/sets',
      subLabel: 'Music sets',
    },
  ]

  const recentCities = cities.slice(0, 5)
  const recentSets = sets.slice(0, 5)

  const recentSocialPosts = socialPosts.slice(0, 5)
  const upcomingScheduled = socialPosts
    .filter(p => p.status === 'scheduled' && p.scheduled_at)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header with Welcome & Time */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">
            Social Media Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Manage your social media content from here.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {formatDate(currentTime, 'HH:mm:ss')}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(currentTime, 'EEEE, MMM d, yyyy')}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link key={stat.label} href={stat.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">{stat.icon}</span>
                <div className="text-right">
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-white/80 text-sm font-medium">{stat.label}</div>
                </div>
              </div>
              {stat.subLabel && (
                <div className="text-white/60 text-xs font-medium">
                  {stat.subLabel}
                </div>
              )}
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/social/compose"
            className="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all text-center text-sm"
          >
            ✏️ Create Post
          </Link>
          <Link
            href="/admin/social/schedule"
            className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all text-center text-sm"
          >
            📅 Schedule
          </Link>
          <Link
            href="/admin/social/review"
            className="px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all text-center text-sm"
          >
            👁️ Review
          </Link>
          <Link
            href="/admin/social/integrations"
            className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all text-center text-sm"
          >
            🔗 Accounts
          </Link>
          <Link
            href="/admin/social/analytics"
            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all text-center text-sm"
          >
            📊 Analytics
          </Link>
          <Link
            href="/admin/cities/new"
            className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all text-center text-sm"
          >
            🏙️ New City
          </Link>
        </div>
      </div>

      {/* Social Media Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Social Posts */}
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Posts</h2>
            <Link
              href="/admin/social/posts"
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentSocialPosts.length > 0 ? (
              recentSocialPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/social/posts/${post.id}`}
                  className="block p-3 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1 line-clamp-1">
                        {post.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(new Date(post.created_at), 'MMM d, yyyy HH:mm')}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        post.status === 'published'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : post.status === 'scheduled'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : post.status === 'review'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-3">No posts yet</p>
                <Link
                  href="/admin/social/compose"
                  className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  Create Your First Post
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Scheduled Posts */}
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Upcoming Schedule</h2>
            <Link
              href="/admin/social/schedule"
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingScheduled.length > 0 ? (
              upcomingScheduled.map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/social/posts/${post.id}`}
                  className="block p-3 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="font-semibold text-white mb-1 line-clamp-1">
                    {post.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    📅 {formatDate(new Date(post.scheduled_at!), 'MMM d, yyyy HH:mm')}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-3">No scheduled posts</p>
                <Link
                  href="/admin/social/compose"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Schedule a Post
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cities & Sets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cities */}
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Cities</h2>
            <Link
              href="/admin/cities"
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentCities.length > 0 ? (
              recentCities.map((city) => (
                <Link
                  key={city.id}
                  href={`/admin/cities/${city.id}`}
                  className="block p-3 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">
                        {city.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {city.country} • {city.region}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        city.status === 'OUT_NOW'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}
                    >
                      {city.status === 'OUT_NOW' ? 'OUT NOW' : 'SOON'}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No cities yet</p>
            )}
          </div>
        </div>

        {/* Recent Sets */}
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Sets</h2>
            <Link
              href="/admin/sets"
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentSets.length > 0 ? (
              recentSets.map((set) => (
                <Link
                  key={set.id}
                  href={`/admin/sets/${set.id}`}
                  className="block p-3 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="font-semibold text-white mb-1">
                    {set.title}
                  </div>
                  {set.duration && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Duration: {set.duration}
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No sets yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
