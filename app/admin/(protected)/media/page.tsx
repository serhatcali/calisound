import { Metadata } from 'next'
import { MediaLibrary } from '@/components/admin/media/MediaLibrary'

export const metadata: Metadata = {
  title: 'Media Library - Admin | CALI Sound',
  description: 'Manage media files and images',
}

export default function MediaLibraryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Media Library
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload and manage images for cities and sets
        </p>
      </div>
      <MediaLibrary />
    </div>
  )
}
