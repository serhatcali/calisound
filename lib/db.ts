import { supabase } from './supabase'
import { City, Set, GlobalLinks, Region, CityStatus, Mood } from '@/types/database'

export async function getAllCities(): Promise<City[]> {
  try {
    // Only show cities that have YouTube videos (youtube_full is not null)
    const { data, error, count } = await supabase
      .from('cities')
      .select('*', { count: 'exact' })
      .not('youtube_full', 'is', null)
      .order('release_datetime', { ascending: false, nullsFirst: false })
    
    if (error) {
      // Only log errors during runtime, not during build
      if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
        console.error('❌ Error fetching cities:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', JSON.stringify(error, null, 2))
      }
      return []
    }
    
    // Only log success during runtime, not during build
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.log('✅ Cities fetched:', data?.length || 0, '(Total in DB:', count || 0, ')')
    }
    return data || []
  } catch (err) {
    // Only log errors during runtime, not during build
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.error('❌ Exception fetching cities:', err)
    }
    return []
  }
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    // Only log errors during runtime, not during build
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.error('Error fetching city:', error)
    }
    return null
  }
  
  return data
}

export async function getCitiesByFilter(
  mood?: Mood,
  region?: Region,
  status?: CityStatus
): Promise<City[]> {
  let query = supabase.from('cities').select('*')
  
  // Only show cities with YouTube videos
  query = query.not('youtube_full', 'is', null)
  
  if (mood) {
    query = query.contains('mood', [mood])
  }
  
  if (region) {
    query = query.eq('region', region)
  }
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query.order('release_datetime', { ascending: false, nullsFirst: false })
  
  if (error) {
    // Only log errors during runtime, not during build
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.error('Error fetching filtered cities:', error)
    }
    return []
  }
  
  return data || []
}

export async function getLatestRelease(): Promise<City | null> {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('status', 'OUT_NOW')
      .not('youtube_full', 'is', null)
      .order('release_datetime', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (error) {
      // Only log errors during runtime, not during build
      if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
        console.error('❌ Error fetching latest release:', error)
        console.error('Error code:', error.code)
      }
      return null
    }
    
    // Only log success during runtime, not during build
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.log('✅ Latest release fetched:', data?.name || 'None')
    }
    return data
  } catch (err) {
    // Only log errors during runtime, not during build
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.error('❌ Exception fetching latest release:', err)
    }
    return null
  }
}

export async function getRelatedCities(city: City, limit: number = 4): Promise<City[]> {
  if (!city.mood || city.mood.length === 0) {
    return []
  }
  
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .neq('id', city.id)
    .overlaps('mood', city.mood)
    .eq('status', 'OUT_NOW')
    .not('youtube_full', 'is', null)
    .limit(limit)
  
  if (error) {
    // Only log errors during runtime, not during build
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.error('Error fetching related cities:', error)
    }
    return []
  }
  
  return data || []
}

export async function getAllSets(): Promise<Set[]> {
  try {
    const { data, error, count } = await supabase
      .from('sets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    
    if (error) {
      // Only log errors during runtime, not during build
      if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
        console.error('❌ Error fetching sets:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', JSON.stringify(error, null, 2))
      }
      return []
    }
    
    // Only log success during runtime, not during build
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.log('✅ Sets fetched:', data?.length || 0, '(Total in DB:', count || 0, ')')
    }
    return data || []
  } catch (err) {
    // Only log errors during runtime, not during build
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.error('❌ Exception fetching sets:', err)
    }
    return []
  }
}

export async function getSetById(id: string): Promise<Set | null> {
  const { data, error } = await supabase
    .from('sets')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    // Only log errors during runtime, not during build
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.error('Error fetching set:', error)
    }
    return null
  }
  
  return data
}

export async function getGlobalLinks(): Promise<GlobalLinks | null> {
  try {
    const { data, error } = await supabase
      .from('global_links')
      .select('*')
      .limit(1)
      .maybeSingle()
    
    if (error) {
      // Only log errors during runtime, not during build
      if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
        console.error('❌ Error fetching global links:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
      }
      return null
    }
    
    // Only log success during runtime, not during build
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.log('✅ Global links fetched:', data ? 'Yes' : 'No')
    }
    return data
  } catch (err) {
    // Only log errors during runtime, not during build
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.error('❌ Exception fetching global links:', err)
    }
    return null
  }
}

export type TrackClickOptions = {
  /** Path where click happened, e.g. /links, /city/istanbul */
  sourcePage?: string
  /** Human-readable source, e.g. "Links Page", "Home", "City: Paris" */
  sourceLabel?: string
}

export async function trackClick(
  linkType: string,
  linkUrl: string,
  options?: TrackClickOptions
) {
  const { error } = await supabase
    .from('click_tracking')
    .insert({
      link_type: linkType,
      link_url: linkUrl,
      clicked_at: new Date().toISOString(),
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
      referrer: typeof window !== 'undefined' ? document.referrer : null,
      source_page: options?.sourcePage ?? null,
      source_label: options?.sourceLabel ?? null,
    })

  if (error) {
    if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
      console.error('Error tracking click:', error)
    }
  }
}
