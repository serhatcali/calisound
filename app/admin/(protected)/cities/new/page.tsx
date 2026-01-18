import { requireAdmin } from '@/lib/admin-auth'
import { CityForm } from '@/components/admin/cities/CityForm'

export default async function AdminCityNewPage() {
  await requireAdmin()

  return <CityForm />
}
