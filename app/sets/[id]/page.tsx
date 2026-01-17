import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SetDetailClient } from '@/components/sets/SetDetailClient'
import { getSetById, getAllSets } from '@/lib/db'

interface SetDetailPageProps {
  params: Promise<{ id: string }>
}

// Required for static export
export async function generateStaticParams() {
  const sets = await getAllSets()
  return sets.map((set) => ({
    id: set.id.toString(),
  }))
}

export async function generateMetadata({ params }: SetDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const set = await getSetById(id)

  if (!set) {
    return {
      title: 'Set Not Found - CALI Sound',
    }
  }

  return {
    title: `${set.title} - CALI Sound`,
    description: set.description || `Listen to ${set.title} by CALI Sound.`,
  }
}

export default async function SetDetailPage({ params }: SetDetailPageProps) {
  const { id } = await params
  const set = await getSetById(id)

  if (!set) {
    notFound()
  }

  return <SetDetailClient set={set} />
}
