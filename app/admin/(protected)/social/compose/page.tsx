import { getSocialPost } from '@/lib/social-media-service'
import { getCampaigns } from '@/lib/social-media-service'
import { getAllCities } from '@/lib/db'
import { SocialComposer } from '@/components/admin/social/SocialComposer'

export const dynamic = 'force-dynamic'

export default async function SocialComposePage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {

  const [post, campaigns, cities] = await Promise.all([
    searchParams.id ? getSocialPost(searchParams.id).catch(() => null) : Promise.resolve(null),
    getCampaigns(),
    getAllCities()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {post ? 'Edit Post' : 'Create New Post'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compose and customize content for all social media platforms
        </p>
      </div>

      <SocialComposer
        initialPost={post || undefined}
        campaigns={campaigns}
        cities={cities}
      />
    </div>
  )
}
