import Link from 'next/link'
import { getGlobalLinks } from '@/lib/db'
import { NewsletterForm } from '@/components/shared/NewsletterForm'

export async function Footer() {
  const links = await getGlobalLinks()

  return (
    <footer className="relative bg-white dark:bg-black border-t border-gray-200 dark:border-gray-900 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Brand Section */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <h3 className="text-2xl font-black mb-3">
                <span className="bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  CALI Sound
                </span>
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Global Afro House City Series. Experience the world through melodic club music.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center lg:text-left">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500">Navigation</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/cities" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all text-sm inline-flex items-center gap-2 group justify-center lg:justify-start">
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-orange-500 transition-colors"></span>
                  Cities
                </Link>
              </li>
              <li>
                <Link href="/sets" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all text-sm inline-flex items-center gap-2 group justify-center lg:justify-start">
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-orange-500 transition-colors"></span>
                  DJ Sets
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all text-sm inline-flex items-center gap-2 group justify-center lg:justify-start">
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-orange-500 transition-colors"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all text-sm inline-flex items-center gap-2 group justify-center lg:justify-start">
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-orange-500 transition-colors"></span>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all text-sm inline-flex items-center gap-2 group justify-center lg:justify-start">
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-orange-500 transition-colors"></span>
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="text-center lg:text-left">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500">Stay Updated</h4>
            <div className="flex justify-center lg:justify-start">
              <NewsletterForm />
            </div>
          </div>

          {/* Social Links */}
          <div className="text-center lg:text-left">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500">Connect</h4>
            <div className="flex flex-col gap-2.5 items-center lg:items-start">
              {links?.youtube && (
                <a
                  href={links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-all text-sm inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-red-500 transition-colors"></span>
                  YouTube
                </a>
              )}
              {links?.spotify && (
                <a
                  href={links.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-all text-sm inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-green-500 transition-colors"></span>
                  Spotify
                </a>
              )}
              {links?.instagram && (
                <a
                  href={links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-all text-sm inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-pink-500 transition-colors"></span>
                  Instagram
                </a>
              )}
              {links?.tiktok && (
                <a
                  href={links.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all text-sm inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-900 dark:group-hover:bg-white transition-colors"></span>
                  TikTok
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              &copy; {new Date().getFullYear()} CALI Sound. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
