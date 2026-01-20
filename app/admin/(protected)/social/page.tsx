import { requireAdmin } from '@/lib/admin-auth'
import { getSocialPosts } from '@/lib/social-media-service'
import { SocialOverview } from '@/components/admin/social/SocialOverview'

export const dynamic = 'force-dynamic'

export default async function SocialMediaPage() {
  await requireAdmin()

  // Get today's and this week's posts
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())

  const [drafts, scheduled, published, failed] = await Promise.all([
    getSocialPosts({ status: 'draft', limit: 10 }),
    getSocialPosts({ status: 'scheduled', limit: 20 }),
    getSocialPosts({ status: 'published', limit: 10 }),
    getSocialPosts({ status: 'failed', limit: 10 })
  ])

  // Get scheduled posts for this week
  const thisWeekScheduled = scheduled.filter(post => {
    if (!post.scheduled_at) return false
    const scheduledDate = new Date(post.scheduled_at)
    return scheduledDate >= weekStart && scheduledDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
  })

  // Get today's scheduled posts
  const todayScheduled = scheduled.filter(post => {
    if (!post.scheduled_at) return false
    const scheduledDate = new Date(post.scheduled_at)
    return scheduledDate >= today && scheduledDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Social Media Suite
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and schedule posts across all platforms
        </p>
      </div>

      <SocialOverview
        drafts={drafts}
        todayScheduled={todayScheduled}
        thisWeekScheduled={thisWeekScheduled}
        published={published}
        failed={failed}
      />
    </div>
  )
}
