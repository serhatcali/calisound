'use server'

import type { Release, PromotionDay, DailyTask, ReleasePlatform } from '@/types/release-planning'
import { createPromotionDay, createDailyTask, getPromotionDays, getDailyTasks } from './release-planning-service'
import { supabaseAdmin } from './supabase-admin'

/**
 * Generate promotion timeline (T-7 to T+3 or T-3 to T+3 for fast mode)
 */
export async function generateTimeline(release: Release): Promise<{
  promotionDays: PromotionDay[]
  dailyTasks: DailyTask[]
}> {
  const releaseDate = new Date(release.release_at)
  const isFastMode = release.fast_mode
  const startOffset = isFastMode ? -3 : -7
  const endOffset = 3

  // Check if timeline already exists
  const existingDays = await getPromotionDays(release.id)
  const existingTasks = await getDailyTasks(release.id)

  // Delete existing timeline if it exists
  if (existingDays.length > 0) {
    await supabaseAdmin
      .from('promotion_days')
      .delete()
      .eq('release_id', release.id)
  }

  if (existingTasks.length > 0) {
    await supabaseAdmin
      .from('daily_tasks')
      .delete()
      .eq('release_id', release.id)
  }

  const promotionDays: PromotionDay[] = []
  const dailyTasks: DailyTask[] = []

  // Generate promotion days
  for (let offset = startOffset; offset <= endOffset; offset++) {
    const dayDate = new Date(releaseDate)
    dayDate.setDate(dayDate.getDate() + offset)
    
    const focus = getDayFocus(offset, isFastMode, release)
    
    const promotionDay = await createPromotionDay({
      release_id: release.id,
      day_offset: offset,
      date: dayDate.toISOString().split('T')[0],
      focus,
    })
    
    promotionDays.push(promotionDay)

    // Generate daily tasks for this day
    const tasks = generateDayTasks(release, offset, isFastMode)
    for (const task of tasks) {
      const createdTask = await createDailyTask({
        release_id: release.id,
        ...task,
      })
      dailyTasks.push(createdTask)
    }
  }

  return { promotionDays, dailyTasks }
}

/**
 * Get focus for a specific day
 */
function getDayFocus(offset: number, isFastMode: boolean, release: Release): string {
  if (offset < 0) {
    // Pre-release days
    if (isFastMode) {
      if (offset === -3) return 'Final preparation and asset review'
      if (offset === -2) return 'Platform copy generation and review'
      if (offset === -1) return 'Final checks and scheduling'
    } else {
      if (offset === -7) return 'Initial announcement and teaser'
      if (offset === -6) return 'Asset preparation'
      if (offset === -5) return 'Platform planning'
      if (offset === -4) return 'Copy creation'
      if (offset === -3) return 'Content review'
      if (offset === -2) return 'Final adjustments'
      if (offset === -1) return 'Pre-launch checks'
    }
  } else if (offset === 0) {
    return 'Release day - Launch across all platforms'
  } else {
    // Post-release days
    if (offset === 1) return 'Post-launch engagement'
    if (offset === 2) return 'Community interaction'
    if (offset === 3) return 'Analytics review'
  }
  return 'Promotion activities'
}

/**
 * Generate tasks for a specific day
 */
function generateDayTasks(
  release: Release,
  offset: number,
  isFastMode: boolean
): Omit<DailyTask, 'id' | 'release_id' | 'created_at' | 'updated_at'>[] {
  const tasks: Omit<DailyTask, 'id' | 'release_id' | 'created_at' | 'updated_at'>[] = []

  if (offset < 0) {
    // Pre-release tasks
    if (offset === (isFastMode ? -3 : -7)) {
      tasks.push({
        day_offset: offset,
        title: 'Review all assets (16:9, 9:16, 1:1)',
        details: 'Ensure all visual assets are ready and meet platform requirements',
        priority: 1,
        completed: false,
      })
      tasks.push({
        day_offset: offset,
        title: 'Verify release date and time',
        details: `Confirm release: ${new Date(release.release_at).toLocaleString('en-US', { timeZone: release.timezone })}`,
        priority: 1,
        completed: false,
      })
    }

    if (offset === (isFastMode ? -2 : -5)) {
      tasks.push({
        day_offset: offset,
        title: 'Generate platform-specific copy',
        details: 'Use AI to generate copy for all selected platforms',
        priority: 1,
        completed: false,
      })
    }

    if (offset === (isFastMode ? -1 : -2)) {
      tasks.push({
        day_offset: offset,
        title: 'Review all platform copy',
        details: 'Check titles, descriptions, hashtags, and tags for each platform',
        priority: 1,
        completed: false,
      })
      tasks.push({
        day_offset: offset,
        title: 'Prepare quick upload links',
        details: 'Ensure all platform upload links are ready',
        priority: 2,
        completed: false,
      })
    }

    if (offset === -1) {
      tasks.push({
        day_offset: offset,
        title: 'Final pre-launch checklist',
        details: 'Verify all assets, copy, and links are ready',
        priority: 1,
        completed: false,
      })
    }
  } else if (offset === 0) {
    // Release day
    tasks.push({
      day_offset: 0,
      title: 'Publish on all platforms',
      details: 'Upload and publish content across all selected platforms',
      priority: 1,
      completed: false,
    })
    tasks.push({
      day_offset: 0,
      title: 'Monitor initial engagement',
      details: 'Track early comments, likes, and shares',
      priority: 2,
      completed: false,
    })
  } else {
    // Post-release tasks
    if (offset === 1) {
      tasks.push({
        day_offset: 1,
        title: 'Respond to comments and messages',
        details: 'Engage with audience across all platforms',
        priority: 2,
        completed: false,
      })
    }
    if (offset === 2) {
      tasks.push({
        day_offset: 2,
        title: 'Share behind-the-scenes content',
        details: 'Post additional content to maintain momentum',
        priority: 3,
        completed: false,
      })
    }
    if (offset === 3) {
      tasks.push({
        day_offset: 3,
        title: 'Review analytics and performance',
        details: 'Analyze metrics across all platforms',
        priority: 2,
        completed: false,
      })
    }
  }

  return tasks
}
