// Release Planning System Types

export type ReleaseStatus = 'draft' | 'planning' | 'active' | 'completed'
export type PlatformPlanStatus = 'scheduled' | 'reminded' | 'published' | 'skipped'
export type AssetKind = '16_9' | '9_16' | '1_1' | 'audio'
export type TaskPriority = 1 | 2 | 3
export type EmailType = 'daily_task' | 'reminder'

export type ReleasePlatform = 
  | 'youtube'
  | 'youtube_shorts'
  | 'instagram_reels'
  | 'instagram_story'
  | 'tiktok'
  | 'tiktok_story'
  | 'twitter'
  | 'soundcloud'

export interface Release {
  id: string
  song_title: string
  city?: string
  country?: string
  local_language: string
  local_language_code: string
  include_english: boolean
  release_at: string // ISO timestamp
  timezone: string
  fast_mode: boolean
  status: ReleaseStatus
  created_by: string
  created_at: string
  updated_at: string
}

export interface ReleaseAsset {
  id: string
  release_id: string
  kind: AssetKind
  storage_path: string
  url?: string
  created_at: string
}

export interface PlatformPlan {
  id: string
  release_id: string
  platform: ReleasePlatform
  planned_at: string // ISO timestamp
  status: PlatformPlanStatus
  reminder_offset_min: number
  title?: string
  description?: string
  hashtags?: string[]
  tags?: string
  asset_urls?: string[]
  quick_upload_link?: string
  ai_generated: boolean
  created_at: string
  updated_at: string
}

export interface PromotionDay {
  id: string
  release_id: string
  day_offset: number // -7 to +3 or -3 to +3
  date: string // ISO date
  focus?: string
  created_at: string
}

export interface DailyTask {
  id: string
  release_id: string
  day_offset: number
  platform?: ReleasePlatform
  title: string
  details?: string
  priority: TaskPriority
  completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface EmailLog {
  id: string
  release_id?: string
  platform_plan_id?: string
  type: EmailType
  recipient: string
  sent_at: string
  sent_date: string // Date string (YYYY-MM-DD) for unique constraint
  subject?: string
  content_preview?: string
}

// Quick Upload Links
export const PLATFORM_UPLOAD_LINKS: Record<ReleasePlatform, string> = {
  youtube: 'https://studio.youtube.com',
  youtube_shorts: 'https://studio.youtube.com',
  instagram_reels: 'https://www.instagram.com/create/reel/',
  instagram_story: 'https://www.instagram.com/create/story/',
  tiktok: 'https://www.tiktok.com/upload',
  tiktok_story: 'https://www.tiktok.com/upload',
  twitter: 'https://x.com/compose/post',
  soundcloud: 'https://soundcloud.com/upload',
}

// Platform Labels
export const PLATFORM_LABELS: Record<ReleasePlatform, string> = {
  youtube: 'YouTube',
  youtube_shorts: 'YouTube Shorts',
  instagram_reels: 'Instagram Reels',
  instagram_story: 'Instagram Story',
  tiktok: 'TikTok',
  tiktok_story: 'TikTok Story',
  twitter: 'X (Twitter)',
  soundcloud: 'SoundCloud',
}
