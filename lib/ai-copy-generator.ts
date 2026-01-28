'use server'

import OpenAI from 'openai'
import type { Release, ReleasePlatform } from '@/types/release-planning'

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

// Lazy initialization - check on every call
function getOpenAIClient(): OpenAI | null {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      console.warn('[AI Copy] OPENAI_API_KEY environment variable is not set')
      return null
    }
    
    const trimmedKey = apiKey.trim()
    
    if (!trimmedKey || trimmedKey === 'your-openai-api-key-here' || trimmedKey.length < 10) {
      console.warn('[AI Copy] OPENAI_API_KEY is invalid or placeholder', {
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
    
    console.log('[AI Copy] OpenAI client initialized', {
      hasApiKey: true,
      apiKeyPrefix: trimmedKey.substring(0, 7),
      apiKeyLength: trimmedKey.length,
      model: MODEL,
    })
    
    return client
  } catch (error) {
    console.error('[AI Copy] Error initializing OpenAI client:', error)
    return null
  }
}

/**
 * Generate platform-specific copy for a release
 */
export async function generatePlatformCopy(
  release: Release,
  platform: ReleasePlatform
): Promise<{
  title: string
  description: string
  hashtags: string[]
  tags?: string
}> {
  // Get OpenAI client (lazy initialization)
  const openai = getOpenAIClient()
  
  // If OpenAI is not configured, return fallback
  if (!openai) {
    console.warn('[AI Copy] OpenAI not available, using fallback copy', {
      hasEnvVar: !!process.env.OPENAI_API_KEY,
      envVarValue: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 7)}...` : 'undefined',
      envVarLength: process.env.OPENAI_API_KEY?.length || 0,
      platform,
      releaseId: release.id,
    })
    return {
      title: `${release.song_title}${release.city ? ` - ${release.city}` : ''}`,
      description: `New release: ${release.song_title}`,
      hashtags: ['#music', '#afrohouse'],
      tags: platform.includes('youtube') ? 'music, afrohouse, electronic' : undefined,
    }
  }

  const prompt = buildPrompt(release, platform)

  try {
    console.log(`[AI Copy] Calling OpenAI API for ${platform}...`, {
      model: MODEL,
      hasApiKey: !!process.env.OPENAI_API_KEY,
      apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7),
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    })
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert social media copywriter specializing in Afro House and electronic music promotion. You create unique, engaging, and platform-optimized content that stands out. Your copy is creative, authentic, and avoids repetitive patterns. You understand platform-specific best practices and audience engagement strategies.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9, // Higher temperature for more creativity and variety
      max_tokens: 1500,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.error('[AI Copy] No content in OpenAI response')
      throw new Error('No content generated')
    }

    console.log(`[AI Copy] Received response for ${platform}`, {
      contentLength: content.length,
      contentPreview: content.substring(0, 200),
    })

    const parsed = parseAIResponse(content, platform, release)
    
    console.log(`[AI Copy] Successfully parsed response for ${platform}`, {
      title: parsed.title,
      descriptionLength: parsed.description.length,
      hashtagCount: parsed.hashtags.length,
    })
    
    return parsed
    } catch (error: any) {
      console.error(`[AI Copy] Error generating AI copy for ${platform}:`, error)
      console.error('[AI Copy] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
        platform,
        status: error?.status,
        code: error?.code,
        type: error?.type,
      })
      
      // Check for quota error
      if (error?.status === 429 && (error?.code === 'insufficient_quota' || error?.type === 'insufficient_quota')) {
        console.error('[AI Copy] ⚠️ OPENAI QUOTA EXCEEDED!')
        console.error('[AI Copy] Your OpenAI API key has exceeded its quota.')
        console.error('[AI Copy] Please check: https://platform.openai.com/account/billing')
        console.error('[AI Copy] Using fallback copy for this platform.')
        // Don't throw, use fallback instead
        return {
          title: `${release.song_title}${release.city ? ` - ${release.city}` : ''}`,
          description: `New release: ${release.song_title}`,
          hashtags: ['#music', '#afrohouse'],
          tags: platform.includes('youtube') ? 'music, afrohouse, electronic' : undefined,
        }
      }
      
      throw new Error(`Failed to generate copy for ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

/**
 * Build prompt for AI generation
 */
function buildPrompt(release: Release, platform: ReleasePlatform): string {
  const releaseDate = new Date(release.release_at)
  const dateStr = releaseDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: release.timezone,
  })

  const languageNote = release.include_english
    ? `MANDATORY: Description MUST be in BOTH languages. Format:
---
[${release.local_language} Section - 3-4 sentences]
Describe the release, connect it to ${release.city || 'the city'}, the musical journey, the Afro House vibe, and what makes this special.

[English Section - 3-4 sentences]
Similar content for international audience, but not a direct translation. Make it engaging and unique.
---
DO NOT use "New release: [title]" - that is too generic.`
    : `Generate all copy in ${release.local_language} (${release.local_language_code}) only. DO NOT use generic phrases like "New release: [title]".`

  const platformGuidelines = getPlatformGuidelines(platform)
  const cityTag = release.city?.toLowerCase().replace(/\s+/g, '') || ''
  const countryTag = release.country?.toLowerCase().replace(/\s+/g, '') || ''

  return `You are an expert social media copywriter for Afro House music. Create DETAILED, ENGAGING, and UNIQUE content. Generic phrases like "New release: [title]" are FORBIDDEN.

Release Details:
- Song Title: ${release.song_title}
- City: ${release.city || 'N/A'}
- Country: ${release.country || 'N/A'}
- Release Date: ${dateStr}
- Language: ${release.local_language} (${release.local_language_code})
${languageNote}

Platform: ${platform}
${platformGuidelines}

TITLE REQUIREMENTS (CRITICAL):
- MUST be creative and unique - NEVER use "Song Title - City" pattern
- Examples of GOOD titles:
  * "Journey Through [City]'s Rhythms: [Song Title]"
  * "Discover [City] Through Deep Afro House"
  * "[Song Title]: Where [City] Meets Electronic Soul"
  * "Experience [City]'s Nightlife: [Song Title]"
- Make it intriguing, not just descriptive
- Platform-appropriate length

DESCRIPTION REQUIREMENTS (CRITICAL):
${release.include_english ? `
MANDATORY FORMAT:
---
[${release.local_language} Section]
Write 3-4 engaging sentences in ${release.local_language}. Include:
- Connection to ${release.city || 'the city'} and its culture
- Musical style and Afro House elements
- What makes this release special
- Invitation to listen

[English Section]
Write 3-4 engaging sentences in English (NOT a direct translation). Include:
- Similar themes but with different wording
- International appeal
- Musical journey description
- Call to action
---
` : `
Write 4-6 engaging sentences in ${release.local_language}. Include:
- Connection to ${release.city || 'the city'} and culture
- Musical style description
- What makes this special
- Invitation to listen
`}
- NEVER use generic phrases like "New release: [title]"
- Tell a story, create intrigue
- Be specific about the music and location

HASHTAG STRATEGY (CRITICAL - MUST BE DIVERSE):
${platform === 'instagram_reels' ? 'Use 20-30 hashtags' : platform === 'tiktok' ? 'Use 8-12 hashtags' : platform === 'twitter' ? 'Use 2-4 hashtags' : 'Use 10-15 hashtags'}

Required hashtag categories (include multiple from each):
1. Location (3-5 tags):
   ${cityTag ? `#${cityTag}, #${cityTag}music, #${cityTag}nightlife,` : ''} ${countryTag ? `#${countryTag}, #${countryTag}music,` : ''} #worldmusic, #globalmusic

2. Genre (5-8 tags):
   #afrohouse, #deephouse, #techhouse, #electronic, #housemusic, #melodichouse, #progressivehouse, #minimalhouse

3. Mood/Energy (3-5 tags):
   #festival, #club, #dance, #party, #nightlife, #vibes, #energy, #groove

4. Niche/Community (3-5 tags):
   #afrobeat, #afroelectronic, #afrodance, #afromusic, #electronicmusic, #dancemusic, #underground, #djlife

5. Trending/Discovery (2-4 tags):
   #newmusic, #musicdiscovery, #freshmusic, #newrelease, #musiclover, #musicproducer

6. Platform-specific (if applicable):
   ${platform.includes('reels') ? '#reels, #reelsvideo, #reelsmusic' : ''}
   ${platform.includes('shorts') ? '#shorts, #shortsvideo' : ''}

TOTAL: ${platform === 'instagram_reels' ? '20-30' : platform === 'tiktok' ? '8-12' : platform === 'twitter' ? '2-4' : '10-15'} unique hashtags

TONE:
- Professional but authentic and energetic
- Platform-appropriate (casual for TikTok, professional for YouTube)
- Engaging and story-driven
- NO emojis unless native to platform

Generate the copy in this exact JSON format:
{
  "title": "Creative, unique title (NOT generic)",
  "description": "Detailed description with language sections if bilingual",
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "tags": "tag1, tag2, tag3" (only for YouTube platforms, comma-separated, max 500 chars)
}`
}

/**
 * Get platform-specific guidelines
 */
function getPlatformGuidelines(platform: ReleasePlatform): string {
  const guidelines: Record<ReleasePlatform, string> = {
    youtube: 'YouTube: Title max 100 chars (make it SEO-friendly and engaging). Description can be 200-500 words. First 2-3 lines are crucial (visible without "Show more"). Include tags (comma-separated, max 500 chars total) - use genre, mood, location, and trending tags.',
    youtube_shorts: 'YouTube Shorts: Short, punchy title (max 60 chars). Description should be 50-150 words, engaging and direct. Include tags (comma-separated, max 500 chars total).',
    instagram_reels: 'Instagram Reels: Engaging caption (100-300 words). Use 15-30 hashtags - mix of trending, niche, location, and genre tags. First line is crucial (visible without expanding).',
    instagram_story: 'Instagram Story: Very short, punchy text (20-50 words). 1-5 hashtags. Can use emojis. Make it attention-grabbing.',
    tiktok: 'TikTok: Trendy, engaging caption (50-200 words). Use 5-10 hashtags - mix trending, niche, and genre tags. Keep it fun, authentic, and engaging. Can use emojis.',
    tiktok_story: 'TikTok Story: Very short, engaging (20-40 words). 1-3 hashtags. Can use emojis.',
    twitter: 'Twitter/X: Max 280 characters total. Concise, engaging, and punchy. Use 1-3 hashtags. Make every word count. Can use emojis sparingly.',
    soundcloud: 'SoundCloud: Professional description (100-300 words). Include genre tags, mood, and relevant hashtags. Focus on musical style and energy.',
  }

  return guidelines[platform]
}

/**
 * Parse AI response into structured format
 */
function parseAIResponse(
  content: string,
  platform: ReleasePlatform,
  release?: Release
): {
  title: string
  description: string
  hashtags: string[]
  tags?: string
} {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate and clean hashtags - ensure variety
      const hashtags = Array.isArray(parsed.hashtags)
        ? parsed.hashtags
            .map((h: string) => h.startsWith('#') ? h : `#${h}`)
            .filter((h: string, i: number, arr: string[]) => arr.indexOf(h) === i) // Remove duplicates
        : []

      // Validate YouTube tags
      let tags = parsed.tags
      if ((platform === 'youtube' || platform === 'youtube_shorts') && tags) {
        if (typeof tags === 'string' && tags.length > 500) {
          tags = tags.substring(0, 497) + '...'
        }
      } else {
        tags = undefined
      }

      // Handle multi-language descriptions
      let description = parsed.description || ''
      
      // Clean up description - ensure proper formatting
      description = description.trim()
      
      // Validate multi-language requirement
      if (release?.include_english && description) {
        // Check if description contains both languages
        // Look for common separators or language indicators
        const hasBothLanguages = 
          description.includes('---') || 
          description.includes('[English') || 
          description.includes('[English Section') ||
          (description.length > 200 && description.split('\n\n').length >= 2)
        
        if (!hasBothLanguages) {
          console.warn('Multi-language description missing, regenerating...')
          // Could trigger regeneration here, but for now we'll add a note
          description = `[${release.local_language}]\n${description}\n\n[English]\n${description}`
        }
      }
      
      // Remove generic phrases
      if (description.toLowerCase().includes('new release:') && description.length < 100) {
        console.warn('Description too generic, may need regeneration')
      }

      // Validate title is not generic
      const title = (parsed.title || '').trim()
      const isGenericTitle = 
        title.toLowerCase().includes('new release') ||
        (title === `${release?.song_title}${release?.city ? ` - ${release.city}` : ''}`) ||
        title.length < 10
      
      if (isGenericTitle && release) {
        console.warn('Title is too generic, may need regeneration')
      }

      // Validate hashtags are diverse
      if (hashtags.length < 5 && (platform === 'instagram_reels' || platform === 'tiktok')) {
        console.warn('Hashtags may be too few, expected more for this platform')
      }

      return {
        title: title || `${release?.song_title || 'New Release'}`,
        description: description,
        hashtags: hashtags.length > 0 ? hashtags : ['#music', '#afrohouse'], // Fallback if empty
        tags,
      }
    }

    // Fallback: try to parse manually
    console.error('[AI Copy] Could not parse JSON from AI response')
    console.error('[AI Copy] Response content (first 1000 chars):', content.substring(0, 1000))
    throw new Error('Could not parse JSON from AI response')
  } catch (error) {
    console.error('[AI Copy] Error parsing AI response:', error)
    console.error('[AI Copy] Full response content:', content)
    console.error('[AI Copy] Response length:', content.length)
    
    // Try to extract at least some information from the response
    const titleMatch = content.match(/title["\s:]+"([^"]+)"/i) || content.match(/Title["\s:]+([^\n]+)/i)
    const descMatch = content.match(/description["\s:]+"([^"]+)"/i) || content.match(/Description["\s:]+([^\n]+)/i)
    const hashtagMatch = content.match(/hashtags["\s:]+\[([^\]]+)\]/i)
    
    if (titleMatch || descMatch || hashtagMatch) {
      console.warn('[AI Copy] Attempting to extract partial data from response')
      const extractedTitle = titleMatch ? titleMatch[1].trim() : undefined
      const extractedDesc = descMatch ? descMatch[1].trim() : undefined
      const extractedHashtags = hashtagMatch 
        ? hashtagMatch[1].split(',').map(h => h.trim().replace(/['"#]/g, '')).filter(Boolean).map(h => h.startsWith('#') ? h : `#${h}`)
        : []
      
      if (extractedTitle || extractedDesc) {
        return {
          title: extractedTitle || 'New Release',
          description: extractedDesc || 'Check out our latest release!',
          hashtags: extractedHashtags.length > 0 ? extractedHashtags : ['#music', '#afrohouse'],
          tags: platform.includes('youtube') ? 'music, afrohouse, electronic' : undefined,
        }
      }
    }
    
    // Return fallback copy
    console.warn('[AI Copy] Using complete fallback copy')
    return {
      title: 'New Release',
      description: 'Check out our latest release!',
      hashtags: ['#music', '#afrohouse'],
      tags: platform.includes('youtube') ? 'music, afrohouse, electronic' : undefined,
    }
  }
}

/**
 * Generate optimal posting times for platforms using AI
 */
export async function generateOptimalPostingTimes(
  release: Release,
  platforms: ReleasePlatform[]
): Promise<Record<ReleasePlatform, Date>> {
  const openai = getOpenAIClient()
  
  if (!openai) {
    console.warn('[AI Copy] OpenAI not available for posting times, using fallback')
    // Fallback to rule-based times
    return generateFallbackPostingTimes(release, platforms)
  }

  const releaseDate = new Date(release.release_at)
  const timezone = release.timezone

  const releaseDateStr = releaseDate.toLocaleString('en-US', { 
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  const prompt = `You are a social media strategy expert. Determine OPTIMAL posting times for each platform based on engagement data and timezone.

Release Details:
- Release Date: ${releaseDateStr} (${timezone})
- Platforms: ${platforms.join(', ')}
- Music Genre: Afro House / Electronic Music
- Target: Global audience

Platform-specific OPTIMAL posting times (based on engagement data):
- YouTube: 2:00 PM - 4:00 PM (peak: 3:00 PM) OR 9:00 AM - 11:00 AM (global reach)
- YouTube Shorts: 12:00 PM - 2:00 PM (peak: 1:00 PM) OR 7:00 PM - 9:00 PM (evening peak)
- Instagram Reels: 9:00 AM - 11:00 AM (peak: 10:00 AM) OR 7:00 PM - 9:00 PM (peak: 8:00 PM)
- Instagram Story: 8:00 AM - 10:00 AM OR 5:00 PM - 7:00 PM
- TikTok: 6:00 AM - 10:00 AM (peak: 8:00 AM) OR 7:00 PM - 9:00 PM (peak: 8:00 PM)
- Twitter/X: 8:00 AM - 10:00 AM OR 12:00 PM - 2:00 PM (peak: 1:00 PM)
- SoundCloud: 10:00 AM - 2:00 PM (peak: 12:00 PM)

CRITICAL REQUIREMENTS:
1. Spread posts throughout the day - DO NOT post all platforms at the same time
2. Each platform should have a DIFFERENT time (at least 2-3 hours apart)
3. Use optimal times for each platform based on engagement data above
4. Consider timezone: ${timezone}
5. Release day is ${releaseDateStr.split(',')[0]} - schedule accordingly

Return JSON format with ISO timestamps in ${timezone} timezone:
{
  "youtube": "2026-02-01T15:00:00",
  "youtube_shorts": "2026-02-01T13:00:00",
  "instagram_reels": "2026-02-01T10:00:00",
  "instagram_story": "2026-02-01T09:00:00",
  "tiktok": "2026-02-01T20:00:00",
  "twitter": "2026-02-01T13:00:00",
  "soundcloud": "2026-02-01T12:00:00"
}

IMPORTANT: Times must be spread throughout the day. No two platforms should post within 1 hour of each other.`

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a social media strategy expert. You determine optimal posting times based on platform-specific engagement data and timezone considerations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent, data-driven results
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated')
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      const result: Record<ReleasePlatform, Date> = {} as any

      for (const platform of platforms) {
        if (parsed[platform]) {
          result[platform] = new Date(parsed[platform])
        } else {
          // Fallback for this platform
          result[platform] = generateFallbackPostingTime(release, platform)
        }
      }

      return result
    }

    throw new Error('Could not parse JSON from AI response')
  } catch (error) {
    console.error('Error generating optimal posting times, using fallback:', error)
    return generateFallbackPostingTimes(release, platforms)
  }
}

/**
 * Generate fallback posting times (rule-based)
 */
function generateFallbackPostingTimes(
  release: Release,
  platforms: ReleasePlatform[]
): Record<ReleasePlatform, Date> {
  const result: Record<ReleasePlatform, Date> = {} as any
  const releaseDate = new Date(release.release_at)

  // Platform-specific optimal times (in release timezone)
  const optimalTimes: Record<ReleasePlatform, number> = {
    youtube: 14, // 2 PM
    youtube_shorts: 13, // 1 PM
    instagram_reels: 10, // 10 AM
    instagram_story: 9, // 9 AM
    tiktok: 19, // 7 PM
    tiktok_story: 18, // 6 PM
    twitter: 12, // 12 PM
    soundcloud: 11, // 11 AM
  }

  // Spread posts throughout the day
  let hourOffset = 0
  for (const platform of platforms) {
    const optimalHour = optimalTimes[platform] || 12
    const postingTime = new Date(releaseDate)
    postingTime.setHours(optimalHour + hourOffset, 0, 0, 0)
    
    // Don't go past 22:00 or before 8:00
    if (postingTime.getHours() >= 22) {
      postingTime.setHours(21, 0, 0, 0)
    }
    if (postingTime.getHours() < 8) {
      postingTime.setHours(8, 0, 0, 0)
    }

    result[platform] = postingTime
    hourOffset += 1.5 // Spread by 1.5 hours
  }

  return result
}

/**
 * Generate fallback posting time for a single platform
 */
function generateFallbackPostingTime(
  release: Release,
  platform: ReleasePlatform
): Date {
  const releaseDate = new Date(release.release_at)
  const optimalTimes: Record<ReleasePlatform, number> = {
    youtube: 14,
    youtube_shorts: 13,
    instagram_reels: 10,
    instagram_story: 9,
    tiktok: 19,
    tiktok_story: 18,
    twitter: 12,
    soundcloud: 11,
  }

  const hour = optimalTimes[platform] || 12
  const postingTime = new Date(releaseDate)
  postingTime.setHours(hour, 0, 0, 0)
  return postingTime
}

/**
 * Generate copy for all selected platforms
 */
export async function generateAllPlatformCopy(
  release: Release,
  platforms: ReleasePlatform[]
): Promise<Record<ReleasePlatform, {
  title: string
  description: string
  hashtags: string[]
  tags?: string
}>> {
  const results: Record<string, any> = {}

  // Generate copy for each platform sequentially (to avoid rate limits)
  for (const platform of platforms) {
    try {
      console.log(`[AI Copy] Generating copy for ${platform}...`)
      results[platform] = await generatePlatformCopy(release, platform)
      
      // Validate the generated copy
      if (results[platform].description.toLowerCase().includes('new release:') && results[platform].description.length < 50) {
        console.warn(`[AI Copy] Generated copy for ${platform} appears too generic`)
      }
      
      if (results[platform].hashtags.length < 5 && (platform === 'instagram_reels' || platform === 'tiktok')) {
        console.warn(`[AI Copy] Generated hashtags for ${platform} may be too few (${results[platform].hashtags.length})`)
      }
      
      console.log(`[AI Copy] Successfully generated copy for ${platform}`, {
        titleLength: results[platform].title.length,
        descriptionLength: results[platform].description.length,
        hashtagCount: results[platform].hashtags.length,
      })
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error: any) {
      console.error(`[AI Copy] Error generating copy for ${platform}:`, error)
      console.error(`[AI Copy] Error details:`, {
        message: error instanceof Error ? error.message : String(error),
        platform,
        status: error?.status,
        code: error?.code,
        type: error?.type,
      })
      
      // Check for quota error
      if (error?.status === 429 && (error?.code === 'insufficient_quota' || error?.type === 'insufficient_quota')) {
        console.error(`[AI Copy] ⚠️ OPENAI QUOTA EXCEEDED for ${platform}!`)
        console.error('[AI Copy] Using fallback copy.')
      }
      
      // Use fallback
      results[platform] = {
        title: `${release.song_title} - ${release.city || 'New Release'}`,
        description: `New release: ${release.song_title}`,
        hashtags: ['#music', '#afrohouse'],
        tags: platform.includes('youtube') ? 'music, afrohouse' : undefined,
      }
      console.warn(`[AI Copy] Using fallback copy for ${platform}`)
    }
  }

  return results as Record<ReleasePlatform, {
    title: string
    description: string
    hashtags: string[]
    tags?: string
  }>
}
