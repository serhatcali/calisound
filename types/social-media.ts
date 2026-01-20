// Social Media Suite Types

export type SocialPlatform = 
  | 'youtube' 
  | 'youtube_shorts' 
  | 'instagram' 
  | 'instagram_story' 
  | 'tiktok' 
  | 'twitter' 
  | 'facebook'

export type PostStatus = 
  | 'draft' 
  | 'review' 
  | 'approved' 
  | 'scheduled' 
  | 'publishing' 
  | 'published' 
  | 'failed'

export type AccountStatus = 
  | 'connected' 
  | 'disconnected' 
  | 'expired' 
  | 'error'

export type JobStatus = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled'

export type AssetType = 'image' | 'video'
export type Privacy = 'public' | 'unlisted' | 'private'

export interface SocialAccount {
  id: string
  platform: SocialPlatform
  handle: string
  account_id?: string
  status: AccountStatus
  scopes: string[]
  token_encrypted?: string
  refresh_encrypted?: string
  expires_at?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface SocialPost {
  id: string
  title: string
  base_text: string
  status: PostStatus
  scheduled_at?: string
  timezone: string
  city_id?: number
  campaign_id?: string
  created_by: string
  approved_by?: string
  approved_at?: string
  published_urls: Record<string, string>
  error_last?: string
  created_at: string
  updated_at: string
  // Relations
  city?: { id: number; name: string; slug: string }
  campaign?: { id: string; name: string }
  variants?: SocialPostVariant[]
}

export interface SocialPostVariant {
  id: string
  post_id: string
  platform: SocialPlatform
  title?: string
  caption?: string
  description?: string
  hashtags: string[]
  tags?: string
  first_comment?: string
  privacy: Privacy
  validation: {
    char_count: number
    warnings: string[]
    errors: string[]
  }
  char_count: number
  created_at: string
  updated_at: string
}

export interface SocialAsset {
  id: string
  storage_path: string
  type: AssetType
  width?: number
  height?: number
  aspect_ratio?: string
  dpi: number
  checksum?: string
  usage?: string
  city_id?: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface SocialTemplate {
  id: string
  platform: SocialPlatform
  name: string
  text_template: string
  hashtag_template?: string
  tag_template?: string
  rules: Record<string, any>
  created_by: string
  created_at: string
  updated_at: string
}

export interface SocialJob {
  id: string
  post_id: string
  platform: SocialPlatform
  step: string
  status: JobStatus
  attempts: number
  last_error?: string
  next_retry_at?: string
  result: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SocialMetricsDaily {
  id: string
  platform: SocialPlatform
  account_id?: string
  date: string
  impressions: number
  views: number
  reach: number
  likes: number
  comments: number
  shares: number
  clicks: number
  followers: number
  watch_time: number
  saves: number
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  name: string
  utm_defaults: {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
  }
  start_at?: string
  end_at?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface SocialAuditLog {
  id: string
  actor_id: string
  action: string
  entity_type: string
  entity_id?: string
  meta: Record<string, any>
  created_at: string
}

// Platform-specific validation rules
export interface PlatformValidation {
  maxChars?: number
  minChars?: number
  maxHashtags?: number
  minHashtags?: number
  maxTags?: number
  tagMaxChars?: number
  requiredFields?: string[]
  aspectRatios?: string[]
  maxFileSize?: number
  allowedFormats?: string[]
}

export const PLATFORM_RULES: Record<SocialPlatform, PlatformValidation> = {
  youtube: {
    maxChars: 5000,
    maxTags: 500,
    tagMaxChars: 500,
    aspectRatios: ['16:9'],
    maxFileSize: 128 * 1024 * 1024, // 128MB
    allowedFormats: ['mp4', 'mov', 'avi']
  },
  youtube_shorts: {
    maxChars: 5000,
    maxTags: 500,
    tagMaxChars: 500,
    aspectRatios: ['9:16'],
    maxFileSize: 128 * 1024 * 1024,
    allowedFormats: ['mp4', 'mov', 'avi']
  },
  instagram: {
    maxChars: 2200,
    maxHashtags: 30,
    minHashtags: 8,
    aspectRatios: ['1:1', '4:5', '16:9'],
    maxFileSize: 100 * 1024 * 1024,
    allowedFormats: ['jpg', 'png', 'mp4']
  },
  instagram_story: {
    maxChars: 2200,
    maxHashtags: 10,
    aspectRatios: ['9:16'],
    maxFileSize: 100 * 1024 * 1024,
    allowedFormats: ['jpg', 'png', 'mp4']
  },
  tiktok: {
    maxChars: 2200,
    maxHashtags: 100,
    aspectRatios: ['9:16'],
    maxFileSize: 287 * 1024 * 1024,
    allowedFormats: ['mp4', 'mov']
  },
  twitter: {
    maxChars: 280,
    maxHashtags: 10,
    aspectRatios: ['16:9', '1:1'],
    maxFileSize: 512 * 1024, // 512KB for images
    allowedFormats: ['jpg', 'png', 'gif', 'mp4']
  },
  facebook: {
    maxChars: 63206,
    maxHashtags: 30,
    aspectRatios: ['16:9', '1:1', '4:5'],
    maxFileSize: 4 * 1024 * 1024 * 1024, // 4GB
    allowedFormats: ['jpg', 'png', 'mp4', 'mov']
  }
}
