'use client'

export function SocialIntegrations() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Integrations - Coming soon. This will include:
      </p>
      <ul className="space-y-2 text-gray-600 dark:text-gray-400 list-disc list-inside mb-6">
        <li>Connect/disconnect accounts</li>
        <li>OAuth flow</li>
        <li>Token management</li>
        <li>Scope management</li>
        <li>Health checks</li>
        <li>Assisted/Auto mode labels</li>
      </ul>
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-400">
          <strong>Note:</strong> Auto-publish mode requires external connector service. 
          Currently, all platforms are in &quot;Assisted&quot; mode (manual upload with generated content).
        </p>
      </div>
    </div>
  )
}
