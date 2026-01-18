import { Metadata } from 'next'
import { ImportFeature } from '@/components/admin/import/ImportFeature'

export const metadata: Metadata = {
  title: 'Import Data - Admin | CALI Sound',
  description: 'Import cities and sets from CSV or JSON',
}

export default function ImportPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Import Data
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Import cities or sets from CSV or JSON files
        </p>
      </div>
      <ImportFeature />
    </div>
  )
}
