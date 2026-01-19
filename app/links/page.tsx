import { Metadata } from 'next'
import { LinksPageClient } from '@/components/links/LinksPageClient'
import { getGlobalLinks } from '@/lib/db'

// Force dynamic rendering to prevent build-time Supabase calls
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Links - CALI Sound | All Music Platforms',
  description: 'All CALI Sound links in one place. Find us on YouTube, Spotify, Apple Music, SoundCloud, Instagram, TikTok and more. Stream Afro House and Afrobeat music.',
  keywords: [
    'calisound',
    'afrohouse',
    'dj',
    'calimusic',
    'afrobeat',
    'cali sound',
    'music links',
    'streaming links',
  ],
  openGraph: {
    title: 'Links - CALI Sound | All Music Platforms',
    description: 'All CALI Sound links in one place. Find us on YouTube, Spotify, Apple Music, and more.',
    url: 'https://calisound.com/links',
  },
  alternates: {
    canonical: 'https://calisound.com/links',
  },
}

export default async function LinksPage() {
  const links = await getGlobalLinks()

  return <LinksPageClient links={links} />
}
