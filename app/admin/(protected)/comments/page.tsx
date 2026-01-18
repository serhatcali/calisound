import { Metadata } from 'next'
import { CommentsModeration } from '@/components/admin/comments/CommentsModeration'

export const metadata: Metadata = {
  title: 'Comments Moderation - Admin | CALI Sound',
  description: 'Moderate comments and reviews',
}

export default function CommentsModerationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Comments Moderation
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and moderate user comments and reviews
        </p>
      </div>
      <CommentsModeration />
    </div>
  )
}
