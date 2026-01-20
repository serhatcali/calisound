import { SocialLibrary } from '@/components/admin/social/SocialLibrary'

export const dynamic = 'force-dynamic'

export default async function SocialLibraryPage() {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Content Library
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage assets, templates, and saved content
        </p>
      </div>

      <SocialLibrary />
    </div>
  )
}
