import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CityPageClient } from '@/components/city/CityPageClient'
import { getCityBySlug, getRelatedCities, getAllCities } from '@/lib/db'

interface CityPageProps {
  params: Promise<{ slug: string }>
}

// Required for static export
export async function generateStaticParams() {
  const cities = await getAllCities()
  return cities.map((city) => ({
    slug: city.slug,
  }))
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug } = await params
  const city = await getCityBySlug(slug)

  if (!city) {
    return {
      title: 'City Not Found - CALI Sound',
    }
  }

  return {
    title: `${city.name} - CALI Sound`,
    description: city.description_en || `Experience ${city.name} through Afro House music.`,
    openGraph: {
      title: `${city.name} - CALI Sound`,
      description: city.description_en || `Experience ${city.name} through Afro House music.`,
      images: city.cover_square_url ? [city.cover_square_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${city.name} - CALI Sound`,
      description: city.description_en || `Experience ${city.name} through Afro House music.`,
      images: city.cover_square_url ? [city.cover_square_url] : [],
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

  return <CityPageClient city={city} relatedCities={relatedCities} />
}
