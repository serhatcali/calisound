import { requireAdmin } from '@/lib/admin-auth'
import { getGlobalLinks } from '@/lib/db'
import { LinksAdminForm } from '@/components/admin/links/LinksAdminForm'

// Force dynamic rendering to prevent build-time Supabase calls
export const dynamic = 'force-dynamic'

export default async function AdminLinksPage() {
  await requireAdmin()
  const links = await getGlobalLinks()

  return <LinksAdminForm links={links} />
}
