import { getSocialPosts } from '@/lib/social-media-service'
import { SocialPostsList } from '@/components/admin/social/SocialPostsList'

export const dynamic = 'force-dynamic'

export default async function SocialPostsPage({
  searchParams,
}: {
  searchParams: { status?: string; city_id?: string }
}) {
  const status = searchParams.status as any || undefined
  const cityId = searchParams.city_id || undefined

  let posts: any[] = []
  try {
    posts = await getSocialPosts({
      status,
      city_id: cityId,
      limit: 100,
    })
  } catch (error: any) {
    console.error('[Social Posts Page] Error fetching posts:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Social Media Posts
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage all your social media posts
        </p>
      </div>

      <SocialPostsList posts={posts} />
    </div>
  )
}
