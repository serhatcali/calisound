import { requireAdmin } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { CityForm } from '@/components/admin/cities/CityForm'
import { notFound } from 'next/navigation'

export default async function AdminCityEditPage({ params }: { params: { id: string } }) {
  await requireAdmin()

  const { data: city, error } = await supabase
    .from('cities')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !city) {
    notFound()
  }

  return <CityForm city={city} />
}
