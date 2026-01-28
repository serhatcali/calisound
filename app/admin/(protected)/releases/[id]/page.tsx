import { requireAdmin } from '@/lib/admin-auth'
import { getRelease, getPlatformPlans, getPromotionDays, getDailyTasks, getReleaseAssets, getEmailLogs } from '@/lib/release-planning-service'
import { ReleaseDetail } from '@/components/admin/releases/ReleaseDetail'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ReleaseDetailPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAdmin()

  try {
    const [release, platformPlans, promotionDays, dailyTasks, assets, emailLogs] = await Promise.all([
      getRelease(params.id).catch((err) => {
        console.error('[Release Detail] Error fetching release:', err)
        throw err
      }),
      getPlatformPlans(params.id).catch((err) => {
        console.error('[Release Detail] Error fetching platform plans:', err)
        return []
      }),
      getPromotionDays(params.id).catch((err) => {
        console.error('[Release Detail] Error fetching promotion days:', err)
        return []
      }),
      getDailyTasks(params.id).catch((err) => {
        console.error('[Release Detail] Error fetching daily tasks:', err)
        return []
      }),
      getReleaseAssets(params.id).catch((err) => {
        console.error('[Release Detail] Error fetching assets:', err)
        return []
      }),
      getEmailLogs({ release_id: params.id }).catch((err) => {
        console.error('[Release Detail] Error fetching email logs:', err)
        return []
      }),
    ])

    if (!release) {
      notFound()
      return null
    }

    return (
      <ReleaseDetail
        release={release}
        platformPlans={platformPlans || []}
        promotionDays={promotionDays || []}
        dailyTasks={dailyTasks || []}
        assets={assets || []}
        emailLogs={emailLogs || []}
      />
    )
  } catch (error) {
    console.error('[Release Detail] Error:', error)
    notFound()
  }
}
