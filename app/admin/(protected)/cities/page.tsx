import { requireAdmin } from '@/lib/admin-auth'
import { getAllCities } from '@/lib/db'
import { CitiesAdminList } from '@/components/admin/cities/CitiesAdminList'

// Force dynamic rendering to prevent build-time Supabase calls
export const dynamic = 'force-dynamic'

export default async function AdminCitiesPage() {
  await requireAdmin()
  const cities = await getAllCities()

  return <CitiesAdminList cities={cities} />
}
