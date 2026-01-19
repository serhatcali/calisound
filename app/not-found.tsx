import Link from 'next/link'
import { getSiteContents } from '@/lib/get-site-content'

export default async function NotFound() {
  const errorContent = await getSiteContents(['error_404_title', 'error_404_message'])
  
  // Fallback values
  const title = errorContent.error_404_title || 'Page Not Found'
  const message = errorContent.error_404_message || 'The page you are looking for does not exist.'
  
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-black text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{message}</p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white rounded-xl font-semibold hover:from-orange-400/90 hover:to-amber-400/90 transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
