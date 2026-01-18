'use client'

import { City } from '@/types/database'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface CitiesAdminListProps {
  cities: City[]
}

export function CitiesAdminList({ cities: initialCities }: CitiesAdminListProps) {
  const [cities, setCities] = useState(initialCities)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'OUT_NOW' | 'SOON'>('all')
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<string>('')

  const filteredCities = cities.filter(city => {
    const matchesSearch = city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.country.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || city.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const toggleCitySelection = (id: string) => {
    setSelectedCities(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    if (selectedCities.size === filteredCities.length) {
      setSelectedCities(new Set())
    } else {
      setSelectedCities(new Set(filteredCities.map(c => c.id)))
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedCities.size === 0) return

    if (bulkAction === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedCities.size} cities?`)) return
      
      try {
        const promises = Array.from(selectedCities).map(id =>
          fetch(`/api/admin/cities/${id}`, { method: 'DELETE' })
        )
        await Promise.all(promises)
        setCities(cities.filter(c => !selectedCities.has(c.id)))
        setSelectedCities(new Set())
        setBulkAction('')
      } catch (error) {
        alert('Error deleting cities')
      }
    } else if (bulkAction === 'status_OUT_NOW') {
      try {
        const promises = Array.from(selectedCities).map(id =>
          fetch(`/api/admin/cities/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'OUT_NOW' }),
          })
        )
        await Promise.all(promises)
        setCities(cities.map(c => 
          selectedCities.has(c.id) ? { ...c, status: 'OUT_NOW' as const } : c
        ))
        setSelectedCities(new Set())
        setBulkAction('')
      } catch (error) {
        alert('Error updating cities')
      }
    } else if (bulkAction === 'status_SOON') {
      try {
        const promises = Array.from(selectedCities).map(id =>
          fetch(`/api/admin/cities/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'SOON' }),
          })
        )
        await Promise.all(promises)
        setCities(cities.map(c => 
          selectedCities.has(c.id) ? { ...c, status: 'SOON' as const } : c
        ))
        setSelectedCities(new Set())
        setBulkAction('')
      } catch (error) {
        alert('Error updating cities')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this city?')) return

    try {
      const response = await fetch(`/api/admin/cities/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCities(cities.filter(c => c.id !== id))
      } else {
        alert('Failed to delete city')
      }
    } catch (error) {
      alert('Error deleting city')
    }
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Slug', 'Country', 'Region', 'Status', 'Release Date', 'YouTube Full']
    const rows = filteredCities.map(city => [
      city.name,
      city.slug,
      city.country,
      city.region,
      city.status,
      city.release_datetime || '',
      city.youtube_full || '',
    ])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cities-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">
            Cities Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all cities in the CALI Sound collection
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all text-sm"
          >
            Export CSV
          </button>
          <Link
            href="/admin/cities/new"
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            + Add New City
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="OUT_NOW">OUT NOW</option>
            <option value="SOON">SOON</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCities.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                {selectedCities.size} city selected
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-black border border-blue-200 dark:border-blue-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select action...</option>
                <option value="status_OUT_NOW">Set Status: OUT NOW</option>
                <option value="status_SOON">Set Status: SOON</option>
                <option value="delete">Delete Selected</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
            <button
              onClick={() => setSelectedCities(new Set())}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Cities Table */}
      <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCities.size === filteredCities.length && filteredCities.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">City</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Country</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Region</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredCities.map((city) => (
                <tr key={city.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCities.has(city.id)}
                      onChange={() => toggleCitySelection(city.id)}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{city.country_flag}</span>
                      <div>
                        <div className="font-semibold text-white">{city.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{city.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white dark:text-gray-300">{city.country}</td>
                  <td className="px-6 py-4 text-white dark:text-gray-300">{city.region}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        city.status === 'OUT_NOW'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}
                    >
                      {city.status === 'OUT_NOW' ? 'OUT NOW' : 'SOON'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/cities/${city.id}`}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(city.id)}
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
        {filteredCities.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No cities found
          </div>
        )}
      </div>
    </div>
  )
}
