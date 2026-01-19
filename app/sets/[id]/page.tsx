import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SetDetailClient } from '@/components/sets/SetDetailClient'
import { StructuredData } from '@/components/shared/StructuredData'
import { VideoSchema } from '@/components/shared/VideoSchema'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { getSetById, getAllSets } from '@/lib/db'

interface SetDetailPageProps {
  params: Promise<{ id: string }>
}

// Force dynamic rendering to prevent build-time Supabase calls
export const dynamic = 'force-dynamic'

// Disable static params generation - use dynamic rendering instead
// export async function generateStaticParams() {
//   const sets = await getAllSets()
//   return sets.map((set) => ({
//     id: set.id.toString(),
//   }))
// }

export async function generateMetadata({ params }: SetDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const set = await getSetById(id)

  if (!set) {
    return {
      title: 'Set Not Found - CALI Sound',
    }
  }

  const setDescription = set.description || `Listen to ${set.title} by CALI Sound. Afro House, Afrobeat DJ set featuring electronic music and club vibes.`
  const keywords = [
    'calisound',
    'afrohouse',
    'dj',
    'calimusic',
    'afrobeat',
    'cali sound',
    set.title,
    'DJ set',
    'Afro House mix',
    'Electronic music',
  ]

  return {
    title: `${set.title} - CALI Sound | DJ Set`,
    description: setDescription,
    keywords,
    openGraph: {
      title: `${set.title} - CALI Sound`,
      description: setDescription,
      url: `https://calisound.com/sets/${set.id}`,
      type: 'music.playlist',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${set.title} - CALI Sound`,
      description: setDescription,
    },
    alternates: {
      canonical: `https://calisound.com/sets/${set.id}`,
    },
  }
}

export default async function SetDetailPage({ params }: SetDetailPageProps) {
  const { id } = await params
  const set = await getSetById(id)

  if (!set) {
    notFound()
  }

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MusicPlaylist',
    name: set.title,
    description: set.description || `Listen to ${set.title} by CALI Sound.`,
    url: `https://calisound.com/sets/${set.id}`,
    genre: ['Afro House', 'Afrobeat', 'Electronic Music', 'DJ Set'],
    creator: {
      '@type': 'MusicGroup',
      name: 'CALI Sound',
    },
    numTracks: set.chapters ? set.chapters.split('\n').filter(line => line.trim()).length : undefined,
  }

  // Breadcrumbs
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'DJ Sets', url: '/sets' },
    { name: set.title, url: `/sets/${set.id}` },
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      {set.youtube_embed && (
        <VideoSchema
          name={set.title}
          description={set.description || `Listen to ${set.title} by CALI Sound.`}
          videoUrl={set.youtube_embed}
          duration={set.duration}
        />
      )}
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <SetDetailClient set={set} />
      </div>
    </>
  )
}
