import { requireAdmin } from '@/lib/admin-auth'
import { getAllSets } from '@/lib/db'
import { SetsAdminList } from '@/components/admin/sets/SetsAdminList'

// Force dynamic rendering to prevent build-time Supabase calls
export const dynamic = 'force-dynamic'

export default async function AdminSetsPage() {
  await requireAdmin()
  const sets = await getAllSets()

  return <SetsAdminList sets={sets} />
}
