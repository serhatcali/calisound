import { Metadata } from 'next'
import { Hero } from '@/components/home/Hero'
import { LatestRelease } from '@/components/home/LatestRelease'
import { CityGrid } from '@/components/home/CityGrid'
import { FeaturedSet } from '@/components/home/FeaturedSet'
import { ListenEverywhere } from '@/components/home/ListenEverywhere'
import { StructuredData } from '@/components/shared/StructuredData'
import { ItemListSchema } from '@/components/shared/ItemListSchema'
import { getAllCities, getLatestRelease, getAllSets, getGlobalLinks } from '@/lib/db'

// Force dynamic rendering to prevent build-time Supabase calls
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'CALI Sound - Global Afro House City Series | Afrobeat DJ Music',
  description: 'Experience the world through Afro House music. CALI Sound brings you city-inspired melodic club music from around the globe. Listen to the best Afro House, Afrobeat, and DJ sets featuring cities worldwide.',
  keywords: [
    'calisound',
    'afrohouse',
    'dj',
    'calimusic',
    'afrobeat',
    'cali sound',
    'Afro House',
    'Melodic House',
    'DJ Sets',
    'Electronic Music',
    'Global Music',
  ],
  openGraph: {
    title: 'CALI Sound - Global Afro House City Series | Afrobeat DJ Music',
    description: 'Experience the world through Afro House music. CALI Sound brings you city-inspired melodic club music from around the globe.',
    images: ['/og-default.jpg'],
    url: 'https://calisound.com',
  },
  alternates: {
    canonical: 'https://calisound.com',
  },
}

export default async function HomePage() {
  // Fetch data safely
  let cities: any[] = []
  let latestRelease: any = null
  let sets: any[] = []
  let globalLinks: any = null

  try {
    const [citiesData, latestReleaseData, setsData, globalLinksData] = await Promise.allSettled([
      getAllCities(),
      getLatestRelease(),
      getAllSets(),
      getGlobalLinks(),
    ])
    
    cities = citiesData.status === 'fulfilled' ? (citiesData.value || []) : []
    latestRelease = latestReleaseData.status === 'fulfilled' ? latestReleaseData.value : null
    sets = setsData.status === 'fulfilled' ? (setsData.value || []) : []
    globalLinks = globalLinksData.status === 'fulfilled' ? globalLinksData.value : null

    console.log('📊 Data loaded:', {
      cities: cities?.length || 0,
      sets: sets?.length || 0,
      hasGlobalLinks: !!globalLinks,
      latestRelease: latestRelease?.name || 'none'
    })
  } catch (error) {
    console.error('⚠️ Data fetch error:', error)
    // Continue with empty data
  }

  // Get the latest set (first one is the most recent)
  const featuredSet = sets.length > 0 ? sets[0] : null

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: 'CALI Sound',
    description: 'Global Afro House City Series. Experience the world through Afro House music.',
    url: 'https://calisound.com',
    genre: ['Afro House', 'Afrobeat', 'Electronic Music', 'Melodic House'],
    sameAs: globalLinks ? [
      globalLinks.youtube,
      globalLinks.spotify,
      globalLinks.instagram,
      globalLinks.tiktok,
    ].filter(Boolean) : [],
  }

  // ItemList Schema for cities (premium SEO)
  const cityListItems = cities.slice(0, 20).map(city => ({
    name: city.name,
    url: `https://calisound.com/city/${city.slug}`,
    description: city.description_en || `Experience ${city.name} through Afro House music.`,
    image: city.cover_square_url || city.banner_16x9_url,
  }))

  return (
    <>
      <StructuredData data={structuredData} />
      {cityListItems.length > 0 && (
        <ItemListSchema
          name="CALI Sound Global Cities"
          description="Explore cities from around the world through Afro House music"
          items={cityListItems}
        />
      )}
      <div className="min-h-screen bg-white dark:bg-black">
        <Hero globalLinks={globalLinks} />
        {latestRelease && <LatestRelease city={latestRelease} />}
        {cities.length > 0 && <CityGrid cities={cities.slice(0, 8)} />}
        {featuredSet && <FeaturedSet set={featuredSet} />}
        <ListenEverywhere globalLinks={globalLinks} />
      </div>
    </>
  )
}
