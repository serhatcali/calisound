import { requireAdmin } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { SetForm } from '@/components/admin/sets/SetForm'
import { notFound } from 'next/navigation'

export default async function AdminSetEditPage({ params }: { params: { id: string } }) {
  await requireAdmin()

  const { data: set, error } = await supabase
    .from('sets')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !set) {
    notFound()
  }

  return <SetForm set={set} />
}
