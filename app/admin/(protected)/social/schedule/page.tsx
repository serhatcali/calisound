import { getSocialPosts } from '@/lib/social-media-service'
import { SocialScheduler } from '@/components/admin/social/SocialScheduler'

export const dynamic = 'force-dynamic'

export default async function SocialSchedulePage() {
  let scheduledPosts: any[] = []
  let approvedPosts: any[] = []

  try {
    [scheduledPosts, approvedPosts] = await Promise.all([
      getSocialPosts({ status: 'scheduled', limit: 100 }),
      getSocialPosts({ status: 'approved', limit: 100 }),
    ])
  } catch (error: any) {
    console.error('[Social Schedule Page] Error fetching posts:', error)
  }

  // Combine and sort by scheduled_at
  const allScheduled = [...scheduledPosts, ...approvedPosts]
    .filter(post => post.scheduled_at)
    .sort((a, b) => {
      const dateA = new Date(a.scheduled_at).getTime()
      const dateB = new Date(b.scheduled_at).getTime()
      return dateA - dateB
    })

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

      <SocialScheduler posts={allScheduled} />
    </div>
  )
}
