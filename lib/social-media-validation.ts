import { PLATFORM_RULES, type SocialPlatform, type SocialPostVariant } from '@/types/social-media'

export interface ValidationResult {
  valid: boolean
  warnings: string[]
  errors: string[]
  char_count: number
}

export function validatePostVariant(
  platform: SocialPlatform,
  variant: Partial<SocialPostVariant>
): ValidationResult {
  const rules = PLATFORM_RULES[platform]
  const result: ValidationResult = {
    valid: true,
    warnings: [],
    errors: [],
    char_count: 0
  }

  // Count characters
  const text = variant.caption || variant.description || variant.title || ''
  result.char_count = text.length

  // Character limits
  if (rules.maxChars && result.char_count > rules.maxChars) {
    result.errors.push(`Exceeds maximum character limit (${rules.maxChars})`)
    result.valid = false
  }
  if (rules.minChars && result.char_count < rules.minChars) {
    result.warnings.push(`Below recommended minimum (${rules.minChars} chars)`)
  }

  // Hashtag validation
  const hashtags = variant.hashtags || []
  if (rules.maxHashtags && hashtags.length > rules.maxHashtags) {
    result.errors.push(`Too many hashtags (max ${rules.maxHashtags})`)
    result.valid = false
  }
  if (rules.minHashtags && hashtags.length < rules.minHashtags) {
    result.warnings.push(`Consider adding more hashtags (recommended: ${rules.minHashtags}-${rules.maxHashtags})`)
  }

  // Check for duplicate hashtags
  const uniqueHashtags = new Set(hashtags.map(h => h.toLowerCase()))
  if (uniqueHashtags.size !== hashtags.length) {
    result.warnings.push('Duplicate hashtags detected')
  }

  // YouTube tags validation
  if (platform === 'youtube' || platform === 'youtube_shorts') {
    const tags = variant.tags || ''
    const tagChars = tags.length
    if (tagChars > 500) {
      result.errors.push(`YouTube tags exceed 500 characters (${tagChars})`)
      result.valid = false
    }
    const tagCount = tags.split(',').filter(t => t.trim()).length
    if (tagCount > 500) {
      result.errors.push(`Too many tags (max 500)`)
      result.valid = false
    }
  }

  // Twitter character limit
  if (platform === 'twitter' && result.char_count > 280) {
    result.errors.push('Exceeds Twitter 280 character limit')
    result.valid = false
  }

  // Required fields
  if (rules.requiredFields) {
    for (const field of rules.requiredFields) {
      if (!variant[field as keyof SocialPostVariant]) {
        result.errors.push(`Missing required field: ${field}`)
        result.valid = false
      }
    }
  }

  return result
}

export function validateAspectRatio(
  platform: SocialPlatform,
  width?: number,
  height?: number
): { valid: boolean; message?: string; recommended?: string } {
  if (!width || !height) {
    return { valid: false, message: 'Dimensions required' }
  }

  const rules = PLATFORM_RULES[platform]
  if (!rules.aspectRatios || rules.aspectRatios.length === 0) {
    return { valid: true }
  }

  const ratio = width / height
  const aspectRatio = `${width}:${height}`

  // Check if matches any recommended aspect ratio
  for (const recommended of rules.aspectRatios) {
    const [w, h] = recommended.split(':').map(Number)
    const recommendedRatio = w / h
    const tolerance = 0.05 // 5% tolerance

    if (Math.abs(ratio - recommendedRatio) < tolerance) {
      return { valid: true, recommended: recommended }
    }
  }

  return {
    valid: false,
    message: `Aspect ratio ${aspectRatio} not recommended`,
    recommended: rules.aspectRatios[0]
  }
}

export function formatHashtags(hashtags: string[]): string {
  return hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
}

export function parseHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g
  const matches = text.match(hashtagRegex) || []
  return matches.map(tag => tag.substring(1)) // Remove #
}

export function formatYouTubeTags(tags: string[]): string {
  return tags.join(', ')
}

export function parseYouTubeTags(text: string): string[] {
  return text.split(',').map(t => t.trim()).filter(Boolean)
}
