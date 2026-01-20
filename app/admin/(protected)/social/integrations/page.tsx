import { SocialIntegrations } from '@/components/admin/social/SocialIntegrations'

export const dynamic = 'force-dynamic'

export default async function SocialIntegrationsPage() {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Integrations
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect and manage social media accounts
        </p>
      </div>

      <SocialIntegrations />
    </div>
  )
}
