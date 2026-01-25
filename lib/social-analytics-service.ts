'use server'

import { supabaseAdmin } from './supabase-admin'
import type { SocialPost, SocialJob, SocialMetricsDaily } from '@/types/social-media'

// Get analytics overview
export async function getSocialAnalyticsOverview() {
  // Get post stats
  const { data: posts, error: postsError } = await supabaseAdmin
    .from('social_posts')
    .select('status, created_at, published_urls')

  if (postsError) throw postsError

  const totalPosts = posts?.length || 0
  const publishedPosts = posts?.filter(p => p.status === 'published').length || 0
  const draftPosts = posts?.filter(p => p.status === 'draft').length || 0
  const failedPosts = posts?.filter(p => p.status === 'failed').length || 0
  const scheduledPosts = posts?.filter(p => p.status === 'scheduled').length || 0

  // Count platforms with published URLs
  const platformsPublished = new Set<string>()
  posts?.forEach(post => {
    if (post.published_urls && typeof post.published_urls === 'object') {
      Object.keys(post.published_urls).forEach(platform => {
        platformsPublished.add(platform)
      })
    }
  })

  // Get job stats
  const { data: jobs, error: jobsError } = await supabaseAdmin
    .from('social_jobs')
    .select('status, created_at')

  if (jobsError) throw jobsError

  const totalJobs = jobs?.length || 0
  const completedJobs = jobs?.filter(j => j.status === 'completed').length || 0
  const failedJobs = jobs?.filter(j => j.status === 'failed').length || 0
  const pendingJobs = jobs?.filter(j => j.status === 'pending').length || 0

  // Get metrics stats
  const { data: metrics, error: metricsError } = await supabaseAdmin
    .from('social_metrics_daily')
    .select('views, likes, comments, shares, clicks')

  if (metricsError) throw metricsError

  const totalViews = metrics?.reduce((sum, m) => sum + (m.views || 0), 0) || 0
  const totalLikes = metrics?.reduce((sum, m) => sum + (m.likes || 0), 0) || 0
  const totalComments = metrics?.reduce((sum, m) => sum + (m.comments || 0), 0) || 0
  const totalShares = metrics?.reduce((sum, m) => sum + (m.shares || 0), 0) || 0
  const totalClicks = metrics?.reduce((sum, m) => sum + (m.clicks || 0), 0) || 0

  return {
    posts: {
      total: totalPosts,
      published: publishedPosts,
      draft: draftPosts,
      failed: failedPosts,
      scheduled: scheduledPosts,
      platformsPublished: platformsPublished.size,
    },
    jobs: {
      total: totalJobs,
      completed: completedJobs,
      failed: failedJobs,
      pending: pendingJobs,
    },
    metrics: {
      views: totalViews,
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      clicks: totalClicks,
    },
  }
}

// Get platform performance
export async function getPlatformPerformance(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get posts by platform
  const { data: posts, error: postsError } = await supabaseAdmin
    .from('social_posts')
    .select('published_urls, status, created_at')
    .gte('created_at', startDate.toISOString())

  if (postsError) throw postsError

  const platformStats: Record<string, {
    posts: number
    published: number
    failed: number
  }> = {}

  posts?.forEach(post => {
    if (post.published_urls && typeof post.published_urls === 'object') {
      Object.keys(post.published_urls).forEach(platform => {
        if (!platformStats[platform]) {
          platformStats[platform] = { posts: 0, published: 0, failed: 0 }
        }
        platformStats[platform].posts++
        if (post.status === 'published') {
          platformStats[platform].published++
        } else if (post.status === 'failed') {
          platformStats[platform].failed++
        }
      })
    }
  })

  // Get metrics by platform
  const { data: metrics, error: metricsError } = await supabaseAdmin
    .from('social_metrics_daily')
    .select('platform, views, likes, comments, shares, clicks')
    .gte('date', startDate.toISOString().split('T')[0])

  if (metricsError) throw metricsError

  const platformMetrics: Record<string, {
    views: number
    likes: number
    comments: number
    shares: number
    clicks: number
  }> = {}

  metrics?.forEach(metric => {
    if (!platformMetrics[metric.platform]) {
      platformMetrics[metric.platform] = {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        clicks: 0,
      }
    }
    platformMetrics[metric.platform].views += metric.views || 0
    platformMetrics[metric.platform].likes += metric.likes || 0
    platformMetrics[metric.platform].comments += metric.comments || 0
    platformMetrics[metric.platform].shares += metric.shares || 0
    platformMetrics[metric.platform].clicks += metric.clicks || 0
  })

  // Combine stats
  const platforms = Object.keys({ ...platformStats, ...platformMetrics })
  return platforms.map(platform => ({
    platform,
    ...platformStats[platform],
    ...platformMetrics[platform],
  }))
}

// Get top performing posts
export async function getTopPosts(limit: number = 10) {
  // For now, return posts with published URLs (we don't have metrics linked to posts yet)
  const { data: posts, error } = await supabaseAdmin
    .from('social_posts')
    .select(`
      id,
      title,
      base_text,
      status,
      published_urls,
      created_at,
      updated_at,
      city:cities(name),
      campaign:campaigns(name)
    `)
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return posts as any[]
}

// Get daily metrics for chart
export async function getDailyMetrics(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: metrics, error } = await supabaseAdmin
    .from('social_metrics_daily')
    .select('date, platform, views, likes, comments, shares, clicks')
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) throw error

  // Group by date
  const dailyData: Record<string, {
    views: number
    likes: number
    comments: number
    shares: number
    clicks: number
  }> = {}

  metrics?.forEach(metric => {
    const date = metric.date
    if (!dailyData[date]) {
      dailyData[date] = {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        clicks: 0,
      }
    }
    dailyData[date].views += metric.views || 0
    dailyData[date].likes += metric.likes || 0
    dailyData[date].comments += metric.comments || 0
    dailyData[date].shares += metric.shares || 0
    dailyData[date].clicks += metric.clicks || 0
  })

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    ...data,
  }))
}

// Get top cities
export async function getTopCities(limit: number = 10) {
  const { data: posts, error } = await supabaseAdmin
    .from('social_posts')
    .select('city_id, city:cities(name, slug)')
    .not('city_id', 'is', null)
    .eq('status', 'published')

  if (error) throw error

  const cityCounts: Record<string, { name: string; slug: string; count: number }> = {}
  posts?.forEach((post: any) => {
    if (post.city) {
      const key = post.city_id
      if (!cityCounts[key]) {
        cityCounts[key] = {
          name: post.city.name,
          slug: post.city.slug,
          count: 0,
        }
      }
      cityCounts[key].count++
    }
  })

  return Object.values(cityCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
