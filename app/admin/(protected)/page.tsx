import { requireAdmin } from '@/lib/admin-auth'
import { getAllCities, getAllSets, getGlobalLinks } from '@/lib/db'
import { getSocialPosts, getSocialAccounts } from '@/lib/social-media-service'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

// Force dynamic rendering to prevent build-time Supabase calls
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  await requireAdmin()

  const [cities, sets, links, socialPosts, socialAccounts] = await Promise.all([
    getAllCities(),
    getAllSets(),
    getGlobalLinks(),
    getSocialPosts({ limit: 10 }).catch(() => []),
    getSocialAccounts().catch(() => []),
  ])

  return (
    <AdminDashboard
      cities={cities}
      sets={sets}
      links={links}
      socialPosts={socialPosts}
      socialAccounts={socialAccounts}
    />
  )
}
