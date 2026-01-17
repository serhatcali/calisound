import { Metadata } from 'next'
import { CitiesPageClient } from '@/components/cities/CitiesPageClient'
import { getAllCities } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Cities - CALI Sound',
  description: 'Explore all cities in the CALI Sound Global Afro House City Series.',
}

export default async function CitiesPage() {
  const cities = await getAllCities()
  
  console.log('📊 Cities page - cities count:', cities?.length || 0)

  return <CitiesPageClient initialCities={cities} />
}
