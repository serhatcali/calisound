import { Metadata } from 'next'
import { ActivityLogs } from '@/components/admin/activity/ActivityLogs'

export const metadata: Metadata = {
  title: 'Activity Logs - Admin | CALI Sound',
  description: 'View all activity logs and changes',
}

export default function ActivityLogsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Activity Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track all changes and activities in the system
        </p>
      </div>
      <ActivityLogs />
    </div>
  )
}
