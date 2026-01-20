import { getSocialPosts } from '@/lib/social-media-service'
import { getSocialJobs } from '@/lib/social-media-service'
import { SocialPublishing } from '@/components/admin/social/SocialPublishing'

export const dynamic = 'force-dynamic'

export default async function SocialPublishingPage() {
  let publishedPosts: any[] = []
  let failedPosts: any[] = []
  let publishingPosts: any[] = []
  let jobs: any[] = []

  try {
    [publishedPosts, failedPosts, publishingPosts, jobs] = await Promise.all([
      getSocialPosts({ status: 'published', limit: 100 }),
      getSocialPosts({ status: 'failed', limit: 100 }),
      getSocialPosts({ status: 'publishing', limit: 100 }),
      getSocialJobs(),
    ])
  } catch (error: any) {
    console.error('[Social Publishing Page] Error fetching data:', error)
  }

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

      <SocialPublishing
        published={publishedPosts}
        failed={failedPosts}
        publishing={publishingPosts}
        jobs={jobs}
      />
    </div>
  )
}
