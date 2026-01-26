'use server'

import { supabaseAdmin } from './supabase-admin'
import type {
  Release,
  ReleaseAsset,
  PlatformPlan,
  PromotionDay,
  DailyTask,
  EmailLog,
  ReleasePlatform,
  ReleaseStatus,
} from '@/types/release-planning'

// Releases
export async function getReleases(filters?: {
  status?: ReleaseStatus
  limit?: number
}) {
  let query = supabaseAdmin
    .from('releases')
    .select('*')
    .order('release_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Release[]
}

export async function getRelease(id: string) {
  const { data, error } = await supabaseAdmin
    .from('releases')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Release
}

export async function createRelease(release: {
  song_title: string
  city?: string
  country?: string
  local_language: string
  local_language_code: string
  include_english: boolean
  release_at: string
  timezone?: string
}) {
  // Check if release is < 7 days away
  const releaseDate = new Date(release.release_at)
  const now = new Date()
  const daysUntilRelease = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const fastMode = daysUntilRelease < 7

  const { data, error } = await supabaseAdmin
    .from('releases')
    .insert({
      ...release,
      timezone: release.timezone || 'Europe/Istanbul',
      fast_mode: fastMode,
      status: 'draft',
      created_by: 'admin',
    })
    .select()
    .single()

  if (error) throw error
  return data as Release
}

export async function updateRelease(id: string, updates: Partial<Release>) {
  const { data, error } = await supabaseAdmin
    .from('releases')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Release
}

export async function deleteRelease(id: string) {
  const { error } = await supabaseAdmin
    .from('releases')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Release Assets
export async function getReleaseAssets(releaseId: string) {
  const { data, error } = await supabaseAdmin
    .from('release_assets')
    .select('*')
    .eq('release_id', releaseId)
    .order('kind', { ascending: true })

  if (error) throw error
  return data as ReleaseAsset[]
}

export async function createReleaseAsset(asset: {
  release_id: string
  kind: '16_9' | '9_16' | '1_1' | 'audio'
  storage_path: string
  url?: string
}) {
  const { data, error } = await supabaseAdmin
    .from('release_assets')
    .insert(asset)
    .select()
    .single()

  if (error) throw error
  return data as ReleaseAsset
}

export async function deleteReleaseAsset(id: string) {
  const { error } = await supabaseAdmin
    .from('release_assets')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Platform Plans
export async function getPlatformPlans(releaseId: string) {
  const { data, error } = await supabaseAdmin
    .from('platform_plans')
    .select('*')
    .eq('release_id', releaseId)
    .order('planned_at', { ascending: true })

  if (error) throw error
  return data as PlatformPlan[]
}

export async function createPlatformPlan(plan: {
  release_id: string
  platform: ReleasePlatform
  planned_at: string
  reminder_offset_min?: number
  title?: string
  description?: string
  hashtags?: string[]
  tags?: string
  asset_urls?: string[]
  quick_upload_link?: string
  ai_generated?: boolean
}) {
  const { data, error } = await supabaseAdmin
    .from('platform_plans')
    .insert({
      ...plan,
      status: 'scheduled',
      reminder_offset_min: plan.reminder_offset_min || 120,
      ai_generated: plan.ai_generated || false,
    })
    .select()
    .single()

  if (error) throw error
  return data as PlatformPlan
}

export async function updatePlatformPlan(id: string, updates: Partial<PlatformPlan>) {
  const { data, error } = await supabaseAdmin
    .from('platform_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as PlatformPlan
}

// Promotion Days
export async function getPromotionDays(releaseId: string) {
  const { data, error } = await supabaseAdmin
    .from('promotion_days')
    .select('*')
    .eq('release_id', releaseId)
    .order('day_offset', { ascending: true })

  if (error) throw error
  return data as PromotionDay[]
}

export async function createPromotionDay(day: {
  release_id: string
  day_offset: number
  date: string
  focus?: string
}) {
  const { data, error } = await supabaseAdmin
    .from('promotion_days')
    .insert(day)
    .select()
    .single()

  if (error) throw error
  return data as PromotionDay
}

// Daily Tasks
export async function getDailyTasks(releaseId: string, filters?: {
  day_offset?: number
  completed?: boolean
}) {
  let query = supabaseAdmin
    .from('daily_tasks')
    .select('*')
    .eq('release_id', releaseId)
    .order('day_offset', { ascending: true })
    .order('priority', { ascending: true })

  if (filters?.day_offset !== undefined) {
    query = query.eq('day_offset', filters.day_offset)
  }

  if (filters?.completed !== undefined) {
    query = query.eq('completed', filters.completed)
  }

  const { data, error } = await query
  if (error) throw error
  return data as DailyTask[]
}

export async function createDailyTask(task: {
  release_id: string
  day_offset: number
  platform?: ReleasePlatform
  title: string
  details?: string
  priority?: 1 | 2 | 3
}) {
  const { data, error } = await supabaseAdmin
    .from('daily_tasks')
    .insert({
      ...task,
      priority: task.priority || 2,
      completed: false,
    })
    .select()
    .single()

  if (error) throw error
  return data as DailyTask
}

export async function updateDailyTask(id: string, updates: Partial<DailyTask>) {
  const { data, error } = await supabaseAdmin
    .from('daily_tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as DailyTask
}

// Email Logs
export async function getEmailLogs(filters?: {
  release_id?: string
  type?: 'daily_task' | 'reminder'
  date?: string
}) {
  let query = supabaseAdmin
    .from('email_logs')
    .select('*')
    .order('sent_at', { ascending: false })

  if (filters?.release_id) {
    query = query.eq('release_id', filters.release_id)
  }

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.date) {
    query = query.gte('sent_at', `${filters.date}T00:00:00Z`)
      .lt('sent_at', `${filters.date}T23:59:59Z`)
  }

  const { data, error } = await query
  if (error) throw error
  return data as EmailLog[]
}

export async function createEmailLog(log: {
  release_id?: string
  platform_plan_id?: string
  type: 'daily_task' | 'reminder'
  recipient?: string
  subject?: string
  content_preview?: string
}) {
  const { data, error } = await supabaseAdmin
    .from('email_logs')
    .insert({
      ...log,
      recipient: log.recipient || 'djcalitr@gmail.com',
      sent_date: new Date().toISOString().split('T')[0], // Store date for unique constraint
    })
    .select()
    .single()

  if (error) throw error
  return data as EmailLog
}
