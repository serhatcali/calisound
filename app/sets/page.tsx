import { Metadata } from 'next'
import Link from 'next/link'
import { getAllSets } from '@/lib/db'
import { SetsPageClient } from '@/components/sets/SetsPageClient'

export const metadata: Metadata = {
  title: 'DJ Sets - CALI Sound',
  description: 'Explore CALI Sound DJ sets and mixes.',
}

export default async function SetsPage() {
  const sets = await getAllSets()
  
  console.log('📊 Sets page - sets count:', sets?.length || 0)

  return <SetsPageClient sets={sets} />
}
