import { requireAdmin } from '@/lib/admin-auth'
import { SetForm } from '@/components/admin/sets/SetForm'

export default async function AdminSetNewPage() {
  await requireAdmin()

  return <SetForm />
}
