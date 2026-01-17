export type Region = 'Europe' | 'MENA' | 'Asia' | 'Americas'
export type CityStatus = 'SOON' | 'OUT_NOW'
export type Mood = 'festival' | 'luxury' | 'sunset' | 'deep'

export interface City {
  id: string
  name: string
  slug: string
  country: string
  country_flag: string
  region: Region
  mood: Mood[]
  status: CityStatus
  release_datetime: string | null
  cover_square_url: string | null
  banner_16x9_url: string | null
  shorts_9x16_url: string | null
  youtube_full: string | null
  youtube_shorts: string | null
  instagram: string | null
  tiktok: string | null
  description_en: string | null
  description_local: string | null
  yt_title: string | null
  yt_description: string | null
  yt_tags: string | null
  hashtags: string | null
  created_at?: string
  updated_at?: string
}

export interface Set {
  id: string
  title: string
  youtube_embed: string
  duration: string | null
  chapters: string | null
  description: string | null
  created_at?: string
}

export interface GlobalLinks {
  id?: string
  youtube: string | null
  instagram: string | null
  tiktok: string | null
  spotify: string | null
  apple_music: string | null
  soundcloud: string | null
  x: string | null
  facebook: string | null
  updated_at?: string
}

export interface ClickTracking {
  id?: string
  link_type: string
  link_url: string
  clicked_at: string
  user_agent?: string
  referrer?: string
}
