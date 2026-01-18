'use client'

import { Set } from '@/types/database'
import Link from 'next/link'
import { useState } from 'react'

interface SetsAdminListProps {
  sets: Set[]
}

export function SetsAdminList({ sets: initialSets }: SetsAdminListProps) {
  const [sets, setSets] = useState(initialSets)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredSets = sets.filter(set =>
    set.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (set.description && set.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this set?')) return

    try {
      const response = await fetch(`/api/admin/sets/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSets(sets.filter(s => s.id !== id))
      } else {
        alert('Failed to delete set')
      }
    } catch (error) {
      alert('Error deleting set')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">
            Sets Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all DJ sets in the CALI Sound collection
          </p>
        </div>
        <Link
          href="/admin/sets/new"
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
        >
          + Add New Set
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <input
          type="text"
          placeholder="Search sets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Sets Table */}
      <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">YouTube</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredSets.map((set) => (
                <tr key={set.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{set.title}</div>
                    {set.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                        {set.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white dark:text-gray-300">
                    {set.duration || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {set.youtube_embed ? (
                      <a
                        href={set.youtube_embed}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/sets/${set.id}`}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(set.id)}
                        className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSets.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No sets found
          </div>
        )}
      </div>
    </div>
  )
}
