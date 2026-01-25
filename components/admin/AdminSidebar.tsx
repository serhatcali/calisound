'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/cities', label: 'Cities', icon: '🏙️' },
  { href: '/admin/sets', label: 'Sets', icon: '🎵' },
  { href: '/admin/media', label: 'Media Library', icon: '🖼️' },
  { href: '/admin/links', label: 'Global Links', icon: '🔗' },
  { href: '/admin/social', label: 'Social', icon: '📱', isExpandable: true },
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

const socialSubMenuItems = [
  { href: '/admin/social', label: 'Overview', icon: '📊' },
  { href: '/admin/social/compose', label: 'Compose', icon: '✍️' },
  { href: '/admin/social/posts', label: 'Posts', icon: '📝' },
  { href: '/admin/social/schedule', label: 'Schedule', icon: '📅' },
  { href: '/admin/social/publishing', label: 'Publishing', icon: '🚀' },
  { href: '/admin/social/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/social/library', label: 'Library', icon: '📚' },
  { href: '/admin/social/integrations', label: 'Integrations', icon: '🔌' },
  { href: '/admin/social/settings', label: 'Settings', icon: '⚙️' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const normalizedPath = pathname.replace('/admin/(protected)', '/admin')
  const isSocialActive = normalizedPath.startsWith('/admin/social')
  // Always start with false to match server render
  const [isSocialOpen, setIsSocialOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <aside className="w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 min-h-screen fixed left-0 top-16 z-40">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = normalizedPath === item.href || normalizedPath.startsWith(item.href + '/')
          
          // Handle expandable Social menu
          if (item.isExpandable && item.href === '/admin/social') {
            return (
              <div key={item.href}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setIsSocialOpen(!isSocialOpen)
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                    isSocialActive
                      ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-600 dark:text-orange-400 font-semibold border border-orange-200 dark:border-orange-800'
                      : 'text-white dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <span className="text-sm">▼</span>
                </button>
                {isSocialOpen && (
                  <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                    {socialSubMenuItems.map((subItem) => {
                      const isSubActive = normalizedPath === subItem.href || normalizedPath.startsWith(subItem.href + '/')
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            isSubActive
                              ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                          }`}
                        >
                          <span className="text-base">{subItem.icon}</span>
                          <span>{subItem.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }
          
          // Regular menu items
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
