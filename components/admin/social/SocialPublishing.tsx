'use client'

export function SocialPublishing() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <p className="text-gray-600 dark:text-gray-400">
        Publishing & Jobs - Coming soon. This will include:
      </p>
      <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400 list-disc list-inside">
        <li>Job status per platform</li>
        <li>Retry failed posts</li>
        <li>Error logs</li>
        <li>Re-run functionality (admin only)</li>
      </ul>
    </div>
  )
}
