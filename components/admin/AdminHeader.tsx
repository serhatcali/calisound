'use client'

import Link from 'next/link'

export function AdminHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="h-full flex items-center justify-between px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            CALI
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Admin</span>
        </Link>
        <Link
          href="/"
          target="_blank"
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          View Site →
        </Link>
      </div>
    </header>
  )
}
