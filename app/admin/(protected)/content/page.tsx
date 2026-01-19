import { requireAdmin } from '@/lib/admin-auth'
import { ContentAdminForm } from '@/components/admin/content/ContentAdminForm'

export const dynamic = 'force-dynamic'

export default async function AdminContentPage() {
  await requireAdmin()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Site Content Management</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Edit all text content across the site. Changes will be reflected immediately.
      </p>
      <ContentAdminForm />
    </div>
  )
}
