import { supabase } from './supabase'

export interface SiteContent {
  id: string
  key: string
  section: string
  label: string
  content_en: string
  content_local?: string
  content_type: 'text' | 'textarea' | 'html' | 'rich_text'
  description?: string
  updated_at: string
}

// Cache for site content (5 minutes)
let contentCache: Map<string, SiteContent> | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get all site content from Supabase
 */
export async function getAllSiteContent(): Promise<Map<string, SiteContent>> {
  const now = Date.now()
  
  // Return cached content if still valid
  if (contentCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return contentCache
  }

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('id, key, section, label, content_en, content_local, content_type, description, updated_at')

    if (error) {
      console.error('Error fetching site content:', error)
      // Return empty cache if error
      return contentCache || new Map()
    }

    // Convert array to Map for faster lookups
    const contentMap = new Map<string, SiteContent>()
    data?.forEach(item => {
      contentMap.set(item.key, item)
    })

    // Update cache
    contentCache = contentMap
    cacheTimestamp = now

    return contentMap
  } catch (error) {
    console.error('Exception fetching site content:', error)
    return contentCache || new Map()
  }
}

/**
 * Get a specific content item by key
 */
export async function getSiteContent(key: string, locale: string = 'en'): Promise<string> {
  const content = await getAllSiteContent()
  const item = content.get(key)

  if (!item) {
    // Return fallback or key itself
    return key
  }

  // Return localized content if available, otherwise English
  if (locale !== 'en' && item.content_local) {
    return item.content_local
  }

  return item.content_en
}

/**
 * Get multiple content items at once
 */
export async function getSiteContents(keys: string[], locale: string = 'en'): Promise<Record<string, string>> {
  const content = await getAllSiteContent()
  const result: Record<string, string> = {}

  keys.forEach(key => {
    const item = content.get(key)
    if (item) {
      result[key] = locale !== 'en' && item.content_local ? item.content_local : item.content_en
    } else {
      result[key] = key
    }
  })

  return result
}

/**
 * Clear the content cache (useful after admin updates)
 */
export function clearSiteContentCache(): void {
  contentCache = null
  cacheTimestamp = 0
}
