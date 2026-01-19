'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/cities', label: 'Cities', icon: '🏙️' },
  { href: '/admin/sets', label: 'Sets', icon: '🎵' },
  { href: '/admin/media', label: 'Media Library', icon: '🖼️' },
  { href: '/admin/links', label: 'Global Links', icon: '🔗' },
  { href: '/admin/contacts', label: 'Contacts', icon: '📧' },
  { href: '/admin/comments', label: 'Comments', icon: '💬' },
  { href: '/admin/activity', label: 'Activity Logs', icon: '📝' },
  { href: '/admin/2fa', label: '2FA Settings', icon: '🔐' },
  { href: '/admin/seo', label: 'SEO Tools', icon: '🔍' },
  { href: '/admin/import', label: 'Import', icon: '📥' },
  { href: '/admin/scheduled', label: 'Scheduled', icon: '⏰' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/content', label: 'Site Content', icon: '✏️' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <aside className="w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 min-h-screen fixed left-0 top-16 z-40">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          // Handle both /admin and /admin/(protected) routes
          const normalizedPath = pathname.replace('/admin/(protected)', '/admin')
          const isActive = normalizedPath === item.href || normalizedPath.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-600 dark:text-orange-400 font-semibold border border-orange-200 dark:border-orange-800'
                  : 'text-white dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  )
}
