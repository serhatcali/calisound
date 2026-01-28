'use server'

import OpenAI from 'openai'
import type { Release, PromotionDay, DailyTask, ReleasePlatform } from '@/types/release-planning'
import { createPromotionDay, createDailyTask, getPromotionDays, getDailyTasks, getPlatformPlans } from './release-planning-service'
import { supabaseAdmin } from './supabase-admin'

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

// Lazy initialization - check on every call
function getOpenAIClient(): OpenAI | null {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      console.warn('[Timeline] OPENAI_API_KEY environment variable is not set')
      return null
    }
    
    const trimmedKey = apiKey.trim()
    
    if (!trimmedKey || trimmedKey === 'your-openai-api-key-here' || trimmedKey.length < 10) {
      console.warn('[Timeline] OPENAI_API_KEY is invalid or placeholder', {
        isEmpty: !trimmedKey,
        isPlaceholder: trimmedKey === 'your-openai-api-key-here',
        length: trimmedKey.length,
      })
      return null
    }
    
    // Initialize on demand
    const client = new OpenAI({
      apiKey: trimmedKey,
    })
    
    console.log('[Timeline] OpenAI client initialized', {
      hasApiKey: true,
      apiKeyPrefix: trimmedKey.substring(0, 7),
      apiKeyLength: trimmedKey.length,
      model: MODEL,
    })
    
    return client
  } catch (error) {
    console.error('[Timeline] Error initializing OpenAI client:', error)
    return null
  }
}

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

  // Get platform plans to understand which platforms are being used
  const platformPlans = await getPlatformPlans(release.id)
  const platforms = platformPlans.map(p => p.platform)

  // Try AI-powered timeline generation first (even if no platforms yet)
  let aiTimeline: { promotionDays: PromotionDay[], dailyTasks: DailyTask[] } | null = null
  
  const openai = getOpenAIClient()
  
  if (openai) {
    try {
      // Use platforms if available, otherwise use default set
      const platformsToUse = platforms.length > 0 
        ? platforms 
        : ['youtube', 'instagram_reels', 'tiktok'] as ReleasePlatform[]
      
      console.log('[Timeline] Attempting AI timeline generation...', {
        releaseId: release.id,
        songTitle: release.song_title,
        platforms: platformsToUse,
        isFastMode,
        startOffset,
        endOffset,
        hasApiKey: !!process.env.OPENAI_API_KEY,
        apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7),
      })
      
      aiTimeline = await generateAITimeline(release, startOffset, endOffset, isFastMode, platformsToUse)
      
      console.log('[Timeline] AI timeline generated successfully', {
        days: aiTimeline.promotionDays.length,
        tasks: aiTimeline.dailyTasks.length,
      })
    } catch (error) {
      console.error('[Timeline] Error generating AI timeline, falling back to rule-based:', error)
      console.error('[Timeline] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
  } else {
    console.warn('[Timeline] OpenAI not available, using rule-based timeline', {
      hasApiKey: !!process.env.OPENAI_API_KEY,
      apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7),
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    })
  }

  // Use AI timeline if available, otherwise fall back to rule-based
  if (aiTimeline) {
    return aiTimeline
  }

  // Fallback to rule-based generation
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
    const tasks = generateDayTasks(release, offset, isFastMode, platforms)
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
 * Generate AI-powered timeline with detailed tasks
 */
async function generateAITimeline(
  release: Release,
  startOffset: number,
  endOffset: number,
  isFastMode: boolean,
  platforms: ReleasePlatform[]
): Promise<{ promotionDays: PromotionDay[], dailyTasks: DailyTask[] } | null> {
  // Get OpenAI client (lazy initialization)
  const openai = getOpenAIClient()
  
  if (!openai) {
    console.warn('[Timeline] OpenAI not available for AI timeline generation')
    return null
  }

  const releaseDate = new Date(release.release_at)
  const dateStr = releaseDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: release.timezone,
  })

  const prompt = `You are an expert music release strategist. Create a detailed, actionable promotion timeline for an Afro House release.

Release Details:
- Song Title: ${release.song_title}
- City: ${release.city || 'N/A'}
- Country: ${release.country || 'N/A'}
- Release Date: ${dateStr} (${release.timezone})
- Language: ${release.local_language} (${release.local_language_code})
- Include English: ${release.include_english ? 'Yes' : 'No'}
- Fast Mode: ${isFastMode ? 'Yes (T-3 to T+3)' : 'No (T-7 to T+3)'}
- Platforms: ${platforms.join(', ')}

Create a detailed timeline with:
1. Each day's focus (strategic goal for that day)
2. Specific, actionable tasks for each day
3. Platform-specific tasks where relevant
4. Priority levels (1=high, 2=medium, 3=low)
5. Detailed task descriptions

CRITICAL REQUIREMENTS:
- Tasks should be specific and actionable (not generic)
- Include platform-specific tasks (e.g., "Prepare Instagram Reels caption", "Schedule YouTube upload")
- MANDATORY: Include a video teaser/trailer creation task ONCE, BEFORE release day
  * For Fast Mode: Add ONLY at T-3 (NOT at T-2)
  * For Normal Mode: Add ONLY at T-7 (NOT at T-6 or T-5)
  * Task should be: "Create short video teaser/trailer (15-30 seconds)" with details about using AI tools or video editing
  * IMPORTANT: Add this task ONLY ONCE, at the earliest appropriate day
- Pre-release: Focus on preparation, content creation (including video), review
- Release day: Focus on publishing, monitoring, engagement
- Post-release: Focus on engagement, community building, analytics
- Each day should have 2-5 tasks (more for release day)
- Tasks should be prioritized based on importance
- DO NOT duplicate tasks across days

Video Teaser Requirements:
- Should be created ONCE, early in the timeline (T-7 for normal mode, T-3 for fast mode)
- 15-30 seconds long
- Can mention using AI video generation tools or manual editing
- Should highlight the song, city connection, and Afro House vibe
- Will be used for Instagram Reels, TikTok, YouTube Shorts

Return JSON format:
{
  "days": [
    {
      "day_offset": -3,
      "focus": "Strategic focus for this day",
      "tasks": [
        {
          "title": "Specific task title",
          "details": "Detailed description of what needs to be done",
          "priority": 1,
          "platform": "youtube" (optional, only if platform-specific)
        }
      ]
    }
  ]
}`

  try {
    console.log('[Timeline] Calling OpenAI API for timeline generation...', {
      model: MODEL,
      releaseId: release.id,
      platforms: platforms.length,
      hasApiKey: !!process.env.OPENAI_API_KEY,
      apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7),
    })
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert music release strategist specializing in Afro House and electronic music. You create detailed, actionable promotion timelines with specific tasks for each day.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.error('[Timeline] No content in OpenAI response')
      throw new Error('No content generated')
    }

    console.log('[Timeline] Received AI response', {
      contentLength: content.length,
      contentPreview: content.substring(0, 200),
    })

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const promotionDays: PromotionDay[] = []
    const dailyTasks: DailyTask[] = []
    const seenTaskTitles = new Set<string>() // Track tasks to avoid duplicates

    // Create promotion days and tasks
    for (const dayData of parsed.days || []) {
      const offset = dayData.day_offset
      const dayDate = new Date(releaseDate)
      dayDate.setDate(dayDate.getDate() + offset)

      // Create promotion day
      const promotionDay = await createPromotionDay({
        release_id: release.id,
        day_offset: offset,
        date: dayDate.toISOString().split('T')[0],
        focus: dayData.focus || getDayFocus(offset, isFastMode, release),
      })
      promotionDays.push(promotionDay)

      // Create tasks for this day (avoid duplicates)
      for (const taskData of dayData.tasks || []) {
        const taskTitle = (taskData.title || 'Task').toLowerCase().trim()
        
        // Skip if we've seen this exact task title before
        if (seenTaskTitles.has(taskTitle)) {
          console.warn(`Skipping duplicate task: ${taskData.title}`)
          continue
        }
        
        seenTaskTitles.add(taskTitle)
        
        const task = await createDailyTask({
          release_id: release.id,
          day_offset: offset,
          title: taskData.title || 'Task',
          details: taskData.details || '',
          priority: taskData.priority || 2,
          platform: taskData.platform || null,
          completed: false,
        })
        dailyTasks.push(task)
      }
    }

    if (promotionDays.length === 0 || dailyTasks.length === 0) {
      throw new Error('AI timeline generation returned empty results')
    }

    console.log('[Timeline] AI timeline created successfully', {
      promotionDays: promotionDays.length,
      dailyTasks: dailyTasks.length,
      taskTitles: dailyTasks.map(t => t.title),
    })

    return { promotionDays, dailyTasks }
  } catch (error) {
    console.error('[Timeline] Error in AI timeline generation:', error)
    console.error('[Timeline] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}

/**
 * Get focus for a specific day (fallback)
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
  isFastMode: boolean,
  platforms: ReleasePlatform[] = []
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

    // Video teaser creation (mandatory) - only add once, at the earliest appropriate day
    // Fast mode: T-3, Normal mode: T-7
    if (offset === (isFastMode ? -3 : -7)) {
      tasks.push({
        day_offset: offset,
        title: 'Create short video teaser/trailer (15-30 seconds)',
        details: 'Create a promotional video teaser highlighting the song, city connection, and Afro House vibe. Use AI video generation tools (Runway, Pika, etc.) or video editing software. Video should be optimized for Instagram Reels, TikTok, and YouTube Shorts (9:16 format).',
        priority: 1,
        completed: false,
      })
    }

    if (offset === (isFastMode ? -2 : -5)) {
      tasks.push({
        day_offset: offset,
        title: 'Generate platform-specific copy',
        details: 'Use AI to generate detailed, engaging copy for all selected platforms',
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
    // Release day - create platform-specific tasks
    if (platforms.length > 0) {
      for (const platform of platforms) {
        const platformLabels: Record<ReleasePlatform, string> = {
          youtube: 'YouTube',
          youtube_shorts: 'YouTube Shorts',
          instagram_reels: 'Instagram Reels',
          instagram_story: 'Instagram Story',
          tiktok: 'TikTok',
          tiktok_story: 'TikTok Story',
          twitter: 'Twitter/X',
          soundcloud: 'SoundCloud',
        }
        
        tasks.push({
          day_offset: 0,
          title: `Publish on ${platformLabels[platform]}`,
          details: `Upload and publish content on ${platformLabels[platform]} at the scheduled time`,
          priority: 1,
          platform,
          completed: false,
        })
      }
    } else {
      tasks.push({
        day_offset: 0,
        title: 'Publish on all platforms',
        details: 'Upload and publish content across all selected platforms',
        priority: 1,
        completed: false,
      })
    }
    
    tasks.push({
      day_offset: 0,
      title: 'Monitor initial engagement',
      details: 'Track early comments, likes, and shares across all platforms',
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
