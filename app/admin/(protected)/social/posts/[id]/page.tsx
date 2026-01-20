import { getSocialPost } from '@/lib/social-media-service'
import { getSocialJobs } from '@/lib/social-media-service'
import { SocialPostDetail } from '@/components/admin/social/SocialPostDetail'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SocialPostDetailPage({
  params,
}: {
  params: { id: string }
}) {
  let post: any = null
  let jobs: any[] = []

  try {
    [post, jobs] = await Promise.all([
      getSocialPost(params.id),
      getSocialJobs({ post_id: params.id }),
    ])
  } catch (error: any) {
    console.error('[Social Post Detail Page] Error fetching data:', error)
  }

  if (!post) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <SocialPostDetail post={post} jobs={jobs} />
    </div>
  )
}
