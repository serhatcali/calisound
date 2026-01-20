import { requireAdmin } from '@/lib/admin-auth'
import { SocialPublishing } from '@/components/admin/social/SocialPublishing'

export const dynamic = 'force-dynamic'

export default async function SocialPublishingPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Publishing & Jobs
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track publishing status and manage jobs
        </p>
      </div>

      <SocialPublishing />
    </div>
  )
}
