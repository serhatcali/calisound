'use client'

export function SocialSettings() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <p className="text-gray-600 dark:text-gray-400">
        Settings - Coming soon. This will include:
      </p>
      <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400 list-disc list-inside">
        <li>Role permissions</li>
        <li>Approval requirements</li>
        <li>Posting rules</li>
        <li>Default settings</li>
        <li>Timezone configuration</li>
      </ul>
    </div>
  )
}
