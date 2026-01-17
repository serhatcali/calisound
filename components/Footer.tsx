import Link from 'next/link'
import { getGlobalLinks } from '@/lib/db'

export async function Footer() {
  const links = await getGlobalLinks()

  return (
    <footer className="bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                CALI Sound
              </span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Global Afro House City Series. Experience the world through melodic club music.
            </p>
          </div>

          <div className="text-center md:text-left">
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cities" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Cities
                </Link>
              </li>
              <li>
                <Link href="/sets" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  DJ Sets
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Follow</h4>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {links?.youtube && (
                <a
                  href={links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-gray-200 transition-colors"
                >
                  YouTube
                </a>
              )}
              {links?.spotify && (
                <a
                  href={links.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-gray-200 transition-colors"
                >
                  Spotify
                </a>
              )}
              {links?.instagram && (
                <a
                  href={links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-gray-200 transition-colors"
                >
                  Instagram
                </a>
              )}
              {links?.tiktok && (
                <a
                  href={links.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-gray-200 transition-colors"
                >
                  TikTok
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-900 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} CALI Sound. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
