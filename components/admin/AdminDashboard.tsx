'use client'

import { City, Set, GlobalLinks } from '@/types/database'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface AdminDashboardProps {
  cities: City[]
  sets: Set[]
  links: GlobalLinks | null
}

export function AdminDashboard({ cities, sets, links }: AdminDashboardProps) {
  const stats = [
    {
      label: 'Total Cities',
      value: cities.length,
      icon: '🏙️',
      color: 'from-blue-500 to-cyan-500',
      href: '/admin/cities',
    },
    {
      label: 'Total Sets',
      value: sets.length,
      icon: '🎵',
      color: 'from-purple-500 to-pink-500',
      href: '/admin/sets',
    },
    {
      label: 'Published Cities',
      value: cities.filter(c => c.status === 'OUT_NOW').length,
      icon: '✅',
      color: 'from-green-500 to-emerald-500',
      href: '/admin/cities?status=OUT_NOW',
    },
    {
      label: 'Coming Soon',
      value: cities.filter(c => c.status === 'SOON').length,
      icon: '⏳',
      color: 'from-orange-500 to-amber-500',
      href: '/admin/cities?status=SOON',
    },
  ]

  const recentCities = cities.slice(0, 5)
  const recentSets = sets.slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to CALI Sound Admin Panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link key={stat.label} href={stat.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{stat.icon}</span>
                <div className="text-right">
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-white/80 text-sm font-medium">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/admin/cities/new"
            className="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all text-center text-sm"
          >
            + New City
          </Link>
          <Link
            href="/admin/sets/new"
            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all text-center text-sm"
          >
            + New Set
          </Link>
          <Link
            href="/admin/links"
            className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all text-center text-sm"
          >
            Update Links
          </Link>
          <button
            onClick={() => {
              const data = JSON.stringify({ cities, sets, links }, null, 2)
              const blob = new Blob([data], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `cali-sound-backup-${new Date().toISOString().split('T')[0]}.json`
              a.click()
            }}
            className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all text-center text-sm"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Recent Cities & Sets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cities */}
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Cities</h2>
            <Link
              href="/admin/cities"
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentCities.length > 0 ? (
              recentCities.map((city) => (
                <Link
                  key={city.id}
                  href={`/admin/cities/${city.id}`}
                  className="block p-3 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">
                        {city.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {city.country} • {city.region}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        city.status === 'OUT_NOW'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}
                    >
                      {city.status === 'OUT_NOW' ? 'OUT NOW' : 'SOON'}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No cities yet</p>
            )}
          </div>
        </div>

        {/* Recent Sets */}
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Sets</h2>
            <Link
              href="/admin/sets"
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentSets.length > 0 ? (
              recentSets.map((set) => (
                <Link
                  key={set.id}
                  href={`/admin/sets/${set.id}`}
                  className="block p-3 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="font-semibold text-white mb-1">
                    {set.title}
                  </div>
                  {set.duration && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Duration: {set.duration}
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No sets yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
