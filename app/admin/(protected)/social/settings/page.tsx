import { requireAdmin } from '@/lib/admin-auth'
import { SocialSettings } from '@/components/admin/social/SocialSettings'

export const dynamic = 'force-dynamic'

export default async function SocialSettingsPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Social Media Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure posting rules and defaults
        </p>
      </div>

      <SocialSettings />
    </div>
  )
}
