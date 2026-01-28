import { requireAdmin } from '@/lib/admin-auth'
import { getReleases, getPlatformPlans } from '@/lib/release-planning-service'
import { ReleasesList } from '@/components/admin/releases/ReleasesList'

export const dynamic = 'force-dynamic'

export default async function ReleasesPage() {
  await requireAdmin()

  const releases = await getReleases()
  
  // Get platform plans for all releases (for calendar view)
  const platformPlansMap: Record<string, any[]> = {}
  for (const release of releases) {
    try {
      const plans = await getPlatformPlans(release.id)
      platformPlansMap[release.id] = plans
    } catch (error) {
      console.error(`Error fetching platform plans for release ${release.id}:`, error)
      platformPlansMap[release.id] = []
    }
  }

  return <ReleasesList releases={releases} platformPlans={platformPlansMap} />
}
