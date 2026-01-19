import { Metadata } from 'next'
import { CitiesPageClient } from '@/components/cities/CitiesPageClient'
import { ItemListSchema } from '@/components/shared/ItemListSchema'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { getAllCities } from '@/lib/db'

// Force dynamic rendering to prevent build-time Supabase calls
export const dynamic = 'force-dynamic'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://calisound.music'

export const metadata: Metadata = {
  title: 'Cities - CALI Sound | Global Afro House Music',
  description: 'Explore all cities in the CALI Sound Global Afro House City Series. Discover Afro House, Afrobeat, and DJ music from cities around the world. Filter by mood, region, and status.',
  keywords: [
    'calisound',
    'afrohouse',
    'dj',
    'calimusic',
    'afrobeat',
    'cali sound',
    'Afro House cities',
    'Global music',
    'City music series',
  ],
  openGraph: {
    title: 'Cities - CALI Sound | Global Afro House Music',
    description: 'Explore all cities in the CALI Sound Global Afro House City Series. Discover Afro House and Afrobeat music from cities worldwide.',
    url: `${baseUrl}/cities`,
  },
  alternates: {
    canonical: `${baseUrl}/cities`,
  },
}

export default async function CitiesPage() {
  const cities = await getAllCities()
  
  // Only log during runtime, not during build
  if (!process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
    console.log('📊 Cities page - cities count:', cities?.length || 0)
  }

  // ItemList Schema for all cities (premium SEO)
  const cityListItems = cities.map(city => ({
    name: city.name,
    url: `${baseUrl}/city/${city.slug}`,
    description: city.description_en || `Experience ${city.name} through Afro House music.`,
    image: city.cover_square_url || city.banner_16x9_url,
  }))

  return (
    <>
      <ItemListSchema
        name="CALI Sound Global Cities"
        description="Explore all cities in the CALI Sound Global Afro House City Series"
        items={cityListItems}
      />
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs items={[
            { name: 'Home', url: '/' },
            { name: 'Cities', url: '/cities' },
          ]} />
        </div>
        <CitiesPageClient initialCities={cities} />
      </div>
    </>
  )
}
