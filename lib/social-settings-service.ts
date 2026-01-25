'use server'

import { supabaseAdmin } from './supabase-admin'
import type { SocialSetting, SocialSettingsConfig } from '@/types/social-settings'

// Get all settings
export async function getSocialSettings(): Promise<SocialSetting[]> {
  const { data, error } = await supabaseAdmin
    .from('social_settings')
    .select('*')
    .order('category', { ascending: true })
    .order('key', { ascending: true })

  if (error) throw error
  return data as SocialSetting[]
}

// Get setting by key
export async function getSocialSetting(key: string): Promise<SocialSetting | null> {
  const { data, error } = await supabaseAdmin
    .from('social_settings')
    .select('*')
    .eq('key', key)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data as SocialSetting
}

// Update setting
export async function updateSocialSetting(key: string, value: any): Promise<SocialSetting> {
  const { data, error } = await supabaseAdmin
    .from('social_settings')
    .update({ value })
    .eq('key', key)
    .select()
    .single()

  if (error) throw error
  return data as SocialSetting
}

// Get settings as config object
export async function getSocialSettingsConfig(): Promise<Partial<SocialSettingsConfig>> {
  const settings = await getSocialSettings()
  const config: Partial<SocialSettingsConfig> = {}

  for (const setting of settings) {
    // Parse JSONB value
    let parsedValue = setting.value
    if (typeof parsedValue === 'string') {
      try {
        parsedValue = JSON.parse(parsedValue)
      } catch {
        parsedValue = setting.value
      }
    }

    // Map to config object
    switch (setting.key) {
      case 'timezone':
        config.timezone = parsedValue as string
        break
      case 'require_approval':
        config.require_approval = parsedValue as boolean
        break
      case 'auto_publish':
        config.auto_publish = parsedValue as boolean
        break
      case 'default_hashtags':
        config.default_hashtags = parsedValue as string[]
        break
      case 'default_tags':
        config.default_tags = parsedValue as string
        break
      case 'max_daily_posts':
        config.max_daily_posts = parsedValue as number
        break
      case 'notification_email':
        config.notification_email = parsedValue as string
        break
      case 'enable_notifications':
        config.enable_notifications = parsedValue as boolean
        break
    }
  }

  return config
}
