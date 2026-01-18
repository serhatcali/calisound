import { requireAdmin } from '@/lib/admin-auth'
import { getAllCities } from '@/lib/db'
import { CitiesAdminList } from '@/components/admin/cities/CitiesAdminList'

export default async function AdminCitiesPage() {
  await requireAdmin()
  const cities = await getAllCities()

  return <CitiesAdminList cities={cities} />
}
