'use server'

import { supabaseAdmin } from './supabase-admin'
import type { 
  SocialPost, 
  SocialPostVariant, 
  SocialAccount, 
  SocialAsset,
  SocialTemplate,
  SocialJob,
  Campaign,
  PostStatus,
  SocialPlatform
} from '@/types/social-media'

// Social Posts
export async function getSocialPosts(filters?: {
  status?: PostStatus
  city_id?: number
  limit?: number
}) {
  let query = supabaseAdmin
    .from('social_posts')
    .select(`
      *,
      city:cities(id, name, slug),
      campaign:campaigns(id, name),
      variants:social_post_variants(*)
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.city_id) {
    query = query.eq('city_id', filters.city_id)
  }
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query
  if (error) throw error
  return data as SocialPost[]
}

export async function getSocialPost(id: string) {
  const { data, error } = await supabaseAdmin
    .from('social_posts')
    .select(`
      *,
      city:cities(id, name, slug),
      campaign:campaigns(id, name),
      variants:social_post_variants(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as SocialPost
}

export async function createSocialPost(post: {
  title: string
  base_text: string
  city_id?: number
  campaign_id?: string
  scheduled_at?: string
  timezone?: string
}) {
  const { data, error } = await supabaseAdmin
    .from('social_posts')
    .insert({
      ...post,
      timezone: post.timezone || 'Europe/Istanbul',
      created_by: 'admin',
      status: 'draft'
    })
    .select()
    .single()

  if (error) throw error
  
  // Log audit
  await supabaseAdmin.from('social_audit_log').insert({
    actor_id: 'admin',
    action: 'create',
    entity_type: 'post',
    entity_id: data.id,
    meta: { title: post.title }
  })

  return data as SocialPost
}

export async function updateSocialPost(id: string, updates: Partial<SocialPost>) {
  const { data, error } = await supabaseAdmin
    .from('social_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  
  await supabaseAdmin.from('social_audit_log').insert({
    actor_id: 'admin',
    action: 'update',
    entity_type: 'post',
    entity_id: id,
    meta: updates
  })

  return data as SocialPost
}

export async function deleteSocialPost(id: string) {
  const { error } = await supabaseAdmin
    .from('social_posts')
    .delete()
    .eq('id', id)

  if (error) throw error
  
  await supabaseAdmin.from('social_audit_log').insert({
    actor_id: 'admin',
    action: 'delete',
    entity_type: 'post',
    entity_id: id
  })
}

// Post Variants
export async function createPostVariant(variant: {
  post_id: string
  platform: SocialPlatform
  title?: string
  caption?: string
  description?: string
  hashtags?: string[]
  tags?: string
  first_comment?: string
  privacy?: string
}) {
  const { data, error } = await supabaseAdmin
    .from('social_post_variants')
    .insert({
      ...variant,
      hashtags: variant.hashtags || [],
      privacy: variant.privacy || 'public',
      validation: { char_count: 0, warnings: [], errors: [] },
      char_count: 0
    })
    .select()
    .single()

  if (error) throw error
  return data as SocialPostVariant
}

export async function updatePostVariant(id: string, updates: Partial<SocialPostVariant>) {
  const { data, error } = await supabaseAdmin
    .from('social_post_variants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SocialPostVariant
}

// Accounts
export async function getSocialAccounts() {
  const { data, error } = await supabaseAdmin
    .from('social_accounts')
    .select('*')
    .order('platform', { ascending: true })

  if (error) throw error
  return data as SocialAccount[]
}

// Assets
export async function getSocialAssets(filters?: {
  city_id?: number
  aspect_ratio?: string
  type?: string
}) {
  let query = supabaseAdmin
    .from('social_assets')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.city_id) {
    query = query.eq('city_id', filters.city_id)
  }
  if (filters?.aspect_ratio) {
    query = query.eq('aspect_ratio', filters.aspect_ratio)
  }
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  const { data, error } = await query
  if (error) throw error
  return data as SocialAsset[]
}

// Templates
export async function getSocialTemplates(platform?: SocialPlatform) {
  let query = supabaseAdmin
    .from('social_templates')
    .select('*')
    .order('name', { ascending: true })

  if (platform) {
    query = query.eq('platform', platform)
  }

  const { data, error } = await query
  if (error) throw error
  return data as SocialTemplate[]
}

// Campaigns
export async function getCampaigns() {
  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Campaign[]
}

// Jobs
export async function getSocialJobs(filters?: {
  post_id?: string
  status?: string
}) {
  let query = supabaseAdmin
    .from('social_jobs')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.post_id) {
    query = query.eq('post_id', filters.post_id)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) throw error
  return data as SocialJob[]
}
