import { SocialAnalytics } from '@/components/admin/social/SocialAnalytics'

export const dynamic = 'force-dynamic'

export default async function SocialAnalyticsPage() {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Cross-platform metrics and performance tracking
        </p>
      </div>

      <SocialAnalytics />
    </div>
  )
}
