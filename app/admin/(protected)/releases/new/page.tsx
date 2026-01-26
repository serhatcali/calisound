import { requireAdmin } from '@/lib/admin-auth'
import { NewReleaseForm } from '@/components/admin/releases/NewReleaseForm'

export const dynamic = 'force-dynamic'

export default async function NewReleasePage() {
  await requireAdmin()

  return <NewReleaseForm />
}
