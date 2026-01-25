// Social Media Settings Types

export type SettingsCategory = 'general' | 'posting' | 'approval' | 'notifications'

export interface SocialSetting {
  id: string
  key: string
  value: any // JSONB value
  description?: string
  category: SettingsCategory
  created_at: string
  updated_at: string
}

export interface SocialSettingsConfig {
  timezone: string
  require_approval: boolean
  auto_publish: boolean
  default_hashtags: string[]
  default_tags: string
  max_daily_posts: number
  notification_email: string
  enable_notifications: boolean
}
