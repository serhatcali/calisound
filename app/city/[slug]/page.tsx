import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CityPageClient } from '@/components/city/CityPageClient'
import { StructuredData } from '@/components/shared/StructuredData'
import { VideoSchema } from '@/components/shared/VideoSchema'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { getCityBySlug, getRelatedCities, getAllCities } from '@/lib/db'

interface CityPageProps {
  params: Promise<{ slug: string }>
}

// Force dynamic rendering to prevent build-time Supabase calls
export const dynamic = 'force-dynamic'

// Disable static params generation - use dynamic rendering instead
// export async function generateStaticParams() {
//   const cities = await getAllCities()
//   return cities.map((city) => ({
//     slug: city.slug,
//   }))
// }

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug } = await params
  const city = await getCityBySlug(slug)

  if (!city) {
    return {
      title: 'City Not Found - CALI Sound',
    }
  }

  const cityDescription = city.description_en || `Experience ${city.name} through Afro House music. Listen to CALI Sound's Afrobeat and Afro House tracks inspired by ${city.name}.`
  const keywords = [
    'calisound',
    'afrohouse',
    'dj',
    'calimusic',
    'afrobeat',
    'cali sound',
    city.name,
    `${city.name} music`,
    `${city.name} afro house`,
    city.country,
    city.region,
  ]

  return {
    title: `${city.name} - CALI Sound | Afro House Music`,
    description: cityDescription,
    keywords,
    openGraph: {
      title: `${city.name} - CALI Sound | Afro House Music`,
      description: cityDescription,
      images: city.banner_16x9_url ? [city.banner_16x9_url] : city.cover_square_url ? [city.cover_square_url] : [],
      url: `https://calisound.com/city/${city.slug}`,
      type: 'music.song',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${city.name} - CALI Sound`,
      description: cityDescription,
      images: city.banner_16x9_url ? [city.banner_16x9_url] : city.cover_square_url ? [city.cover_square_url] : [],
    },
    alternates: {
      canonical: `https://calisound.com/city/${city.slug}`,
    },
  }
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params
  const city = await getCityBySlug(slug)

  if (!city) {
    notFound()
  }

  const relatedCities = await getRelatedCities(city)

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: `CALI Sound - ${city.name}`,
    description: city.description_en || `Experience ${city.name} through Afro House music.`,
    url: `https://calisound.com/city/${city.slug}`,
    genre: ['Afro House', 'Afrobeat', 'Electronic Music'],
    inAlbum: {
      '@type': 'MusicAlbum',
      name: 'CALI Sound Global Afro House City Series',
    },
    byArtist: {
      '@type': 'MusicGroup',
      name: 'CALI Sound',
    },
    ...(city.banner_16x9_url && {
      image: {
        '@type': 'ImageObject',
        url: city.banner_16x9_url,
      },
    }),
    ...(city.youtube_full && {
      audio: {
        '@type': 'AudioObject',
        contentUrl: city.youtube_full,
      },
    }),
  }

  // Breadcrumbs
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Cities', url: '/cities' },
    { name: city.name, url: `/city/${city.slug}` },
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      {city.youtube_full && (
        <VideoSchema
          name={`CALI Sound - ${city.name}`}
          description={city.description_en || `Experience ${city.name} through Afro House music.`}
          thumbnailUrl={city.banner_16x9_url || city.cover_square_url}
          videoUrl={city.youtube_full}
        />
      )}
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <CityPageClient city={city} relatedCities={relatedCities} />
      </div>
    </>
  )
}
