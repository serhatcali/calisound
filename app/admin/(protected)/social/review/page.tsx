import { requireAdmin } from '@/lib/admin-auth'
import { SocialReview } from '@/components/admin/social/SocialReview'

export const metadata = {
  title: 'Review Posts | Social Media | Admin',
}

export default async function SocialReviewPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Review Posts
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review and approve posts before they are published
        </p>
      </div>

      <SocialReview />
    </div>
  )
}
