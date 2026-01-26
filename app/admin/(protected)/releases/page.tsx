import { requireAdmin } from '@/lib/admin-auth'
import { getReleases } from '@/lib/release-planning-service'
import { ReleasesList } from '@/components/admin/releases/ReleasesList'

export const dynamic = 'force-dynamic'

export default async function ReleasesPage() {
  await requireAdmin()

  const releases = await getReleases()

  return <ReleasesList releases={releases} />
}
