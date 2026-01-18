import { requireAdmin } from '@/lib/admin-auth'
import { AnalyticsDashboard } from '@/components/admin/analytics/AnalyticsDashboard'

export default async function AdminAnalyticsPage() {
  await requireAdmin()

  return <AnalyticsDashboard />
}
