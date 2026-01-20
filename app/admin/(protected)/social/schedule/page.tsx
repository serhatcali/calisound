import { SocialScheduler } from '@/components/admin/social/SocialScheduler'

export const dynamic = 'force-dynamic'

export default async function SocialSchedulePage() {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Schedule Posts
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Calendar view and queue management
        </p>
      </div>

      <SocialScheduler />
    </div>
  )
}
