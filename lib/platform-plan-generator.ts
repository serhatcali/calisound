'use server'

import type { Release, ReleasePlatform, PlatformPlan } from '@/types/release-planning'
import { PLATFORM_UPLOAD_LINKS } from '@/types/release-planning'
import { generateAllPlatformCopy, generateOptimalPostingTimes } from './ai-copy-generator'
import { createPlatformPlan, getReleaseAssets, getPlatformPlans } from './release-planning-service'
import { supabaseAdmin } from './supabase-admin'

/**
 * Generate platform plans for a release
 */
export async function generatePlatformPlans(
  release: Release,
  platforms: ReleasePlatform[],
  scheduleStrategy: 'spread' | 'same_day' = 'spread'
): Promise<PlatformPlan[]> {
  const releaseDate = new Date(release.release_at)
  const assets = await getReleaseAssets(release.id)
  
  // Check if platform plans already exist for this release
  const existingPlans = await getPlatformPlans(release.id)
  
  // Delete existing plans for the platforms we're about to generate
  if (existingPlans.length > 0) {
    const platformsToDelete = existingPlans
      .filter(p => platforms.includes(p.platform))
      .map(p => p.id)
    
    if (platformsToDelete.length > 0) {
      await supabaseAdmin
        .from('platform_plans')
        .delete()
        .in('id', platformsToDelete)
    }
  }
  
  // Get asset URLs by kind
  const asset16_9 = assets.find(a => a.kind === '16_9')?.url
  const asset9_16 = assets.find(a => a.kind === '9_16')?.url
  const asset1_1 = assets.find(a => a.kind === '1_1')?.url

  // Generate AI copy for all platforms (with error handling)
  let aiCopy: Record<ReleasePlatform, {
    title: string
    description: string
    hashtags: string[]
    tags?: string
  }>
  
  try {
    console.log('[Platform Plans] Starting AI copy generation...', {
      releaseId: release.id,
      songTitle: release.song_title,
      platforms: platforms.length,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10),
      nodeEnv: process.env.NODE_ENV,
    })
    
    aiCopy = await generateAllPlatformCopy(release, platforms)
    
    console.log('[Platform Plans] AI copy generation completed', {
      platformsGenerated: Object.keys(aiCopy).length,
      sampleTitle: Object.values(aiCopy)[0]?.title,
      sampleDescription: Object.values(aiCopy)[0]?.description?.substring(0, 50),
      sampleHashtags: Object.values(aiCopy)[0]?.hashtags?.length,
    })
    
    // Validate AI copy quality
    const hasGenericContent = Object.values(aiCopy).some(copy => 
      copy.description.toLowerCase().includes('new release:') ||
      copy.title === `${release.song_title}${release.city ? ` - ${release.city}` : ''}` ||
      copy.hashtags.length < 5
    )
    
    if (hasGenericContent) {
      console.warn('[Platform Plans] AI copy appears generic, but using it anyway')
    } else {
      console.log('[Platform Plans] AI copy generated successfully', {
        sampleTitle: Object.values(aiCopy)[0]?.title,
        sampleHashtags: Object.values(aiCopy)[0]?.hashtags.length,
      })
    }
  } catch (error) {
    console.error('[Platform Plans] Error generating AI copy, using fallback:', error)
    console.error('[Platform Plans] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    // Use fallback copy if AI generation fails
    aiCopy = {} as any
    for (const platform of platforms) {
      aiCopy[platform] = {
        title: `${release.song_title}${release.city ? ` - ${release.city}` : ''}`,
        description: `New release: ${release.song_title}`,
        hashtags: ['#music', '#afrohouse'],
        tags: platform.includes('youtube') ? 'music, afrohouse, electronic' : undefined,
      }
    }
    console.warn('[Platform Plans] Using fallback copy - AI generation failed')
  }

  const plans: PlatformPlan[] = []

  // Generate optimal posting times using AI
  let optimalTimes: Record<ReleasePlatform, Date>
  try {
    optimalTimes = await generateOptimalPostingTimes(release, platforms)
  } catch (error) {
    console.error('Error generating optimal posting times, using fallback:', error)
    // Fallback to rule-based schedule
    const fallbackTimes = scheduleStrategy === 'same_day'
      ? platforms.reduce((acc, p) => ({ ...acc, [p]: releaseDate }), {} as Record<ReleasePlatform, Date>)
      : generatePostingSchedule(releaseDate, platforms.length).reduce((acc, time, i) => ({
          ...acc,
          [platforms[i]]: time,
        }), {} as Record<ReleasePlatform, Date>)
    optimalTimes = fallbackTimes
  }

  for (const platform of platforms) {
    const plannedAt = optimalTimes[platform] || releaseDate
    const copy = aiCopy[platform]

    // Determine which assets to use for this platform
    const assetUrls = getPlatformAssets(platform, {
      asset16_9,
      asset9_16,
      asset1_1,
    })

    try {
      const plan = await createPlatformPlan({
        release_id: release.id,
        platform,
        planned_at: plannedAt.toISOString(),
        reminder_offset_min: 120, // 2 hours before
        title: copy.title,
        description: copy.description,
        hashtags: copy.hashtags,
        tags: copy.tags,
        asset_urls: assetUrls,
        quick_upload_link: PLATFORM_UPLOAD_LINKS[platform],
        ai_generated: true,
      })

      plans.push(plan)
    } catch (error: any) {
      // If duplicate key error, skip this platform
      if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
        console.warn(`Platform plan for ${platform} already exists, skipping`)
        continue
      }
      throw error
    }
  }

  return plans
}

/**
 * Generate posting schedule (spread posts over release day) - Fallback function
 */
function generatePostingSchedule(releaseDate: Date, count: number): Date[] {
  const times: Date[] = []
  const releaseDay = new Date(releaseDate)
  releaseDay.setHours(10, 0, 0, 0) // Start at 10:00 AM

  // Spread posts throughout the day (every 2-3 hours)
  for (let i = 0; i < count; i++) {
    const time = new Date(releaseDay)
    time.setHours(10 + (i * 2.5)) // 10:00, 12:30, 15:00, etc.
    
    // Don't go past 22:00 (10 PM)
    if (time.getHours() >= 22) {
      time.setHours(22, 0, 0, 0)
    }
    
    times.push(time)
  }

  return times
}

/**
 * Get appropriate assets for platform
 */
function getPlatformAssets(
  platform: ReleasePlatform,
  assets: {
    asset16_9?: string
    asset9_16?: string
    asset1_1?: string
  }
): string[] {
  const urls: string[] = []

  switch (platform) {
    case 'youtube':
    case 'soundcloud':
      // 16:9 for YouTube, SoundCloud
      if (assets.asset16_9) urls.push(assets.asset16_9)
      break

    case 'youtube_shorts':
    case 'instagram_reels':
    case 'tiktok':
    case 'tiktok_story':
    case 'instagram_story':
      // 9:16 for vertical content
      if (assets.asset9_16) urls.push(assets.asset9_16)
      break

    case 'twitter':
      // 1:1 or 16:9 for Twitter
      if (assets.asset1_1) urls.push(assets.asset1_1)
      else if (assets.asset16_9) urls.push(assets.asset16_9)
      break

    default:
      // Fallback to 1:1
      if (assets.asset1_1) urls.push(assets.asset1_1)
  }

  return urls
}
