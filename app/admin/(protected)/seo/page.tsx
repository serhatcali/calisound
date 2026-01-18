import { Metadata } from 'next'
import { SEOTools } from '@/components/admin/seo/SEOTools'

export const metadata: Metadata = {
  title: 'SEO Tools - Admin | CALI Sound',
  description: 'SEO analysis and optimization tools',
}

export default function SEOToolsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          SEO Tools
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze and optimize SEO for your pages
        </p>
      </div>
      <SEOTools />
    </div>
  )
}
