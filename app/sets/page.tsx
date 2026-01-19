import { Metadata } from 'next'
import Link from 'next/link'
import { getAllSets } from '@/lib/db'
import { SetsPageClient } from '@/components/sets/SetsPageClient'
import { ItemListSchema } from '@/components/shared/ItemListSchema'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

// Force dynamic rendering to prevent build-time Supabase calls
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'DJ Sets - CALI Sound | Afro House Mixes & Sets',
  description: 'Explore CALI Sound DJ sets and mixes. Listen to the best Afro House, Afrobeat, and electronic music DJ sets. Full-length mixes and sets available.',
  keywords: [
    'calisound',
    'afrohouse',
    'dj',
    'calimusic',
    'afrobeat',
    'cali sound',
    'DJ sets',
    'Afro House mixes',
    'DJ mixes',
    'Electronic music sets',
  ],
  openGraph: {
    title: 'DJ Sets - CALI Sound | Afro House Mixes & Sets',
    description: 'Explore CALI Sound DJ sets and mixes. Listen to the best Afro House and Afrobeat DJ sets.',
    url: 'https://calisound.com/sets',
  },
  alternates: {
    canonical: 'https://calisound.com/sets',
  },
}

export default async function SetsPage() {
  const sets = await getAllSets()
  
  console.log('📊 Sets page - sets count:', sets?.length || 0)

  // ItemList Schema for all sets (premium SEO)
  const setListItems = sets.map(set => ({
    name: set.title,
    url: `https://calisound.com/sets/${set.id}`,
    description: set.description || `Listen to ${set.title} by CALI Sound.`,
  }))

  return (
    <>
      <ItemListSchema
        name="CALI Sound DJ Sets"
        description="Explore all DJ sets and mixes from CALI Sound"
        items={setListItems}
      />
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs items={[
            { name: 'Home', url: '/' },
            { name: 'DJ Sets', url: '/sets' },
          ]} />
        </div>
        <SetsPageClient sets={sets} />
      </div>
    </>
  )
}
