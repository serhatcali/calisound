'use server'

import OpenAI from 'openai'
import type { Release, ReleasePlatform } from '@/types/release-planning'

// Initialize OpenAI only if API key is available
let openai: OpenAI | null = null
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
} catch (error) {
  console.error('Error initializing OpenAI:', error)
}

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

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
  // If OpenAI is not configured, return fallback
  if (!openai) {
    console.warn('OpenAI API key not configured, using fallback copy')
    return {
      title: `${release.song_title}${release.city ? ` - ${release.city}` : ''}`,
      description: `New release: ${release.song_title}`,
      hashtags: ['#music', '#afrohouse'],
      tags: platform.includes('youtube') ? 'music, afrohouse, electronic' : undefined,
    }
  }

  const prompt = buildPrompt(release, platform)

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional social media copywriter specializing in Afro House and electronic music promotion. Generate engaging, platform-appropriate copy that maintains a professional tone while being authentic to the genre.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated')
    }

    return parseAIResponse(content, platform)
  } catch (error) {
    console.error('Error generating AI copy:', error)
    throw new Error(`Failed to generate copy: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
    ? `Generate copy in ${release.local_language} (primary) and English (secondary).`
    : `Generate copy in ${release.local_language} only.`

  const platformGuidelines = getPlatformGuidelines(platform)

  return `Generate social media copy for a new Afro House release.

Release Details:
- Song Title: ${release.song_title}
- City: ${release.city || 'N/A'}
- Country: ${release.country || 'N/A'}
- Release Date: ${dateStr}
- Language: ${release.local_language} (${release.local_language_code})
${languageNote}

Platform: ${platform}
${platformGuidelines}

Requirements:
- Professional Afro House / city vibe
- NO emojis unless they are native to the platform
- Platform-appropriate tone and length
- Include relevant hashtags (platform-appropriate count)
- For YouTube: Include tags (comma-separated, max 500 characters total)

Generate the copy in this exact JSON format:
{
  "title": "Title here",
  "description": "Description here",
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "tags": "tag1, tag2, tag3" (only for YouTube platforms)
}`
}

/**
 * Get platform-specific guidelines
 */
function getPlatformGuidelines(platform: ReleasePlatform): string {
  const guidelines: Record<ReleasePlatform, string> = {
    youtube: 'YouTube: Title max 100 chars, description can be longer. Include tags (comma-separated, max 500 chars total).',
    youtube_shorts: 'YouTube Shorts: Short, engaging title. Description should be concise. Include tags.',
    instagram_reels: 'Instagram Reels: Engaging caption, 8-30 hashtags recommended. Keep it engaging and authentic.',
    instagram_story: 'Instagram Story: Short, punchy text. 1-10 hashtags. Very concise.',
    tiktok: 'TikTok: Trendy, engaging caption. 3-10 hashtags. Keep it fun and authentic.',
    tiktok_story: 'TikTok Story: Very short, engaging. Minimal hashtags.',
    twitter: 'Twitter/X: Max 280 characters total. Concise and engaging. 1-3 hashtags.',
    soundcloud: 'SoundCloud: Professional description. Include genre tags and relevant hashtags.',
  }

  return guidelines[platform]
}

/**
 * Parse AI response into structured format
 */
function parseAIResponse(content: string, platform: ReleasePlatform): {
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
      
      // Validate and clean
      const hashtags = Array.isArray(parsed.hashtags)
        ? parsed.hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`)
        : []

      // Validate YouTube tags
      let tags = parsed.tags
      if ((platform === 'youtube' || platform === 'youtube_shorts') && tags) {
        if (tags.length > 500) {
          tags = tags.substring(0, 497) + '...'
        }
      } else {
        tags = undefined
      }

      return {
        title: parsed.title || '',
        description: parsed.description || '',
        hashtags,
        tags,
      }
    }

    // Fallback: try to parse manually
    throw new Error('Could not parse JSON from AI response')
  } catch (error) {
    console.error('Error parsing AI response:', error)
    // Return fallback copy
    return {
      title: 'New Release',
      description: 'Check out our latest release!',
      hashtags: ['#music', '#afrohouse'],
      tags: platform.includes('youtube') ? 'music, afrohouse, electronic' : undefined,
    }
  }
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
      results[platform] = await generatePlatformCopy(release, platform)
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Error generating copy for ${platform}:`, error)
      // Use fallback
      results[platform] = {
        title: `${release.song_title} - ${release.city || 'New Release'}`,
        description: `New release: ${release.song_title}`,
        hashtags: ['#music', '#afrohouse'],
        tags: platform.includes('youtube') ? 'music, afrohouse' : undefined,
      }
    }
  }

  return results as Record<ReleasePlatform, {
    title: string
    description: string
    hashtags: string[]
    tags?: string
  }>
}
