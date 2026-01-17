import { Metadata } from 'next'
import { Hero } from '@/components/home/Hero'
import { LatestRelease } from '@/components/home/LatestRelease'
import { CityGrid } from '@/components/home/CityGrid'
import { FeaturedSet } from '@/components/home/FeaturedSet'
import { ListenEverywhere } from '@/components/home/ListenEverywhere'
import { getAllCities, getLatestRelease, getAllSets, getGlobalLinks } from '@/lib/db'

export const metadata: Metadata = {
  title: 'CALI Sound - Global Afro House City Series',
  description: 'Experience the world through Afro House music. CALI Sound brings you city-inspired melodic club music from around the globe.',
  openGraph: {
    title: 'CALI Sound - Global Afro House City Series',
    description: 'Experience the world through Afro House music.',
    images: ['/og-default.jpg'],
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

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Hero globalLinks={globalLinks} />
      {latestRelease && <LatestRelease city={latestRelease} />}
      {cities.length > 0 && <CityGrid cities={cities.slice(0, 8)} />}
      {featuredSet && <FeaturedSet set={featuredSet} />}
      <ListenEverywhere globalLinks={globalLinks} />
    </div>
  )
}
