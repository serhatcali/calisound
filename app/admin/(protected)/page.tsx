import { requireAdmin } from '@/lib/admin-auth'
import { getAllCities, getAllSets, getGlobalLinks } from '@/lib/db'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

// Force dynamic rendering to prevent build-time Supabase calls
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  await requireAdmin()

  const [cities, sets, links] = await Promise.all([
    getAllCities(),
    getAllSets(),
    getGlobalLinks(),
  ])

  return <AdminDashboard cities={cities} sets={sets} links={links} />
}
