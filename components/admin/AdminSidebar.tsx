'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const menuItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/releases', label: 'Releases' },
  { href: '/admin/templates', label: 'Templates' },
  { href: '/admin/cities', label: 'Cities' },
  { href: '/admin/sets', label: 'Sets' },
  { href: '/admin/media', label: 'Media Library' },
  { href: '/admin/links', label: 'Global Links' },
  // Social menu is handled separately to avoid hydration issues
  { href: '/admin/contacts', label: 'Contacts' },
  { href: '/admin/comments', label: 'Comments' },
  { href: '/admin/activity', label: 'Activity Logs' },
  { href: '/admin/2fa', label: '2FA Settings' },
  { href: '/admin/seo', label: 'SEO Tools' },
  { href: '/admin/import', label: 'Import' },
  { href: '/admin/scheduled', label: 'Scheduled' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/content', label: 'Site Content' },
  { href: '/admin/settings', label: 'Settings' },
]

const socialSubMenuItems = [
  { href: '/admin/social', label: 'Overview' },
  { href: '/admin/social/compose', label: 'Compose' },
  { href: '/admin/social/posts', label: 'Posts' },
  { href: '/admin/social/review', label: 'Review' },
  { href: '/admin/social/schedule', label: 'Schedule' },
  { href: '/admin/social/publishing', label: 'Publishing' },
  { href: '/admin/social/analytics', label: 'Analytics' },
  { href: '/admin/social/library', label: 'Library' },
  { href: '/admin/social/integrations', label: 'Integrations' },
  { href: '/admin/social/settings', label: 'Settings' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const normalizedPath = pathname.replace('/admin/(protected)', '/admin')
  const isSocialActive = normalizedPath.startsWith('/admin/social')
  // Initialize to false on both server and client to ensure consistency
  const [isSocialOpen, setIsSocialOpen] = useState(false)

  useEffect(() => {
    // Only update state on client after mount
    if (isSocialActive) {
      setIsSocialOpen(true)
    }
  }, [isSocialActive])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  // Find Links index to insert Social menu after it
  const linksIndex = menuItems.findIndex(item => item.href === '/admin/links')

  return (
    <aside className="w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 min-h-screen fixed left-0 top-16 z-40">
      <nav className="p-4 space-y-2">
        {menuItems.map((item, index) => {
          const isActive = normalizedPath === item.href || normalizedPath.startsWith(item.href + '/')
          
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-600 dark:text-orange-400 font-semibold border border-orange-200 dark:border-orange-800'
                    : 'text-white dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                }`}
              >
                <span>{item.label}</span>
              </Link>
              
              {/* Insert Social menu after Links - always render to avoid hydration issues */}
              {index === linksIndex && (
                <div key="social-menu">
                  <Link
                    href="/admin/social"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsSocialOpen(!isSocialOpen)
                    }}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                      isSocialActive
                        ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-600 dark:text-orange-400 font-semibold border border-orange-200 dark:border-orange-800'
                        : 'text-white dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                    }`}
                  >
                    <span>Social</span>
                    <span className="text-sm">{isSocialOpen ? '▼' : '▶'}</span>
                  </Link>
                  <div 
                    className={isSocialOpen ? 'ml-4 mt-2 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : 'hidden'}
                    suppressHydrationWarning
                  >
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
                          <span>{subItem.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  )
}
