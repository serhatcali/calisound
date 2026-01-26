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
      getRelease(params.id),
      getPlatformPlans(params.id).catch(() => []),
      getPromotionDays(params.id).catch(() => []),
      getDailyTasks(params.id).catch(() => []),
      getReleaseAssets(params.id).catch(() => []),
      getEmailLogs({ release_id: params.id }).catch(() => []),
    ])

    return (
      <ReleaseDetail
        release={release}
        platformPlans={platformPlans}
        promotionDays={promotionDays}
        dailyTasks={dailyTasks}
        assets={assets}
        emailLogs={emailLogs}
      />
    )
  } catch (error) {
    notFound()
  }
}
