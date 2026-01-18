import { Metadata } from 'next'
import { ScheduledPosts } from '@/components/admin/scheduled/ScheduledPosts'

export const metadata: Metadata = {
  title: 'Scheduled Posts - Admin | CALI Sound',
  description: 'Manage scheduled posts and releases',
}

export default function ScheduledPostsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Scheduled Posts
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage scheduled posts and releases
        </p>
      </div>
      <ScheduledPosts />
    </div>
  )
}
