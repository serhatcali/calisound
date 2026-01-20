'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { City, Region, CityStatus, Mood } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'
import { FavoriteButton } from '@/components/shared/FavoriteButton'
import { getFavorites } from '@/lib/favorites'
import { SkeletonLoader } from '@/components/shared/SkeletonLoader'

interface CitiesPageClientProps {
  initialCities: City[]
}

export function CitiesPageClient({ initialCities }: CitiesPageClientProps) {
  console.log('🏙️ CitiesPageClient - initialCities:', initialCities?.length || 0)
  
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedMood, setSelectedMood] = useState<Mood | 'all'>('all')
  const [selectedRegion, setSelectedRegion] = useState<Region | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<CityStatus | 'all'>('all')
  const [favorites, setFavorites] = useState<number[]>([])

  useEffect(() => {
    setFavorites(getFavorites())
    
    const handleFavoritesChange = () => {
      setFavorites(getFavorites())
    }
    
    window.addEventListener('favorites-changed', handleFavoritesChange)
    return () => window.removeEventListener('favorites-changed', handleFavoritesChange)
  }, [])

  const filteredCities = useMemo(() => {
    return initialCities.filter((city) => {
      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(city.id)) return false
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          city.name.toLowerCase().includes(query) ||
          city.country.toLowerCase().includes(query) ||
          city.region.toLowerCase().includes(query) ||
          city.mood.some(m => m.toLowerCase().includes(query))
        if (!matchesSearch) return false
      }
      
      // Other filters
      if (selectedMood !== 'all' && !city.mood.includes(selectedMood)) return false
      if (selectedRegion !== 'all' && city.region !== selectedRegion) return false
      if (selectedStatus !== 'all' && city.status !== selectedStatus) return false
      return true
    })
  }, [initialCities, searchQuery, showFavoritesOnly, favorites, selectedMood, selectedRegion, selectedStatus])

  const moods: Mood[] = ['festival', 'luxury', 'sunset', 'deep']
  const regions: Region[] = ['Europe', 'MENA', 'Asia', 'Americas']
  const statuses: CityStatus[] = ['SOON', 'OUT_NOW']

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedMood !== 'all') count++
    if (selectedRegion !== 'all') count++
    if (selectedStatus !== 'all') count++
    return count
  }, [selectedMood, selectedRegion, selectedStatus])

  return (
    <div className="min-h-screen bg-white dark:bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
            All Cities
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
            Filter and explore the CALI Sound city collection
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cities by name, country, region, or mood..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all shadow-soft"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </motion.div>

        {/* Favorites Toggle */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.03 }}
            className="mb-4 flex justify-center"
          >
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                showFavoritesOnly
                  ? 'bg-gradient-to-r from-red-500/80 to-pink-500/80 dark:from-red-500/70 dark:to-pink-500/70 text-white'
                  : 'bg-white dark:bg-black text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'
              } shadow-soft`}
            >
              {showFavoritesOnly ? 'Show All Cities' : `Show Favorites (${favorites.length})`}
            </button>
          </motion.div>
        )}

        {/* Filters - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-black rounded-2xl mb-8 shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Filters
              </span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <motion.div
              animate={{ rotate: isFiltersOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </button>

          {/* Filter Content */}
          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mood Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-300 mb-3">
                Mood
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedMood('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedMood === 'all'
                      ? 'bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white'
                      : 'bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900'
                  }`}
                >
                  All
                </button>
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                      selectedMood === mood
                        ? 'bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white'
                        : 'bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-300 mb-3">
                Region
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedRegion('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedRegion === 'all'
                      ? 'bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white'
                      : 'bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900'
                  }`}
                >
                  All
                </button>
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      selectedRegion === region
                        ? 'bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white'
                        : 'bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-300 mb-3">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedStatus === 'all'
                      ? 'bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white'
                      : 'bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900'
                  }`}
                >
                  All
                </button>
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      selectedStatus === status
                        ? 'bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white'
                        : 'bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900'
                    }`}
                  >
                    {status === 'OUT_NOW' ? 'OUT NOW' : status}
                  </button>
                ))}
              </div>
            </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600 dark:text-gray-400 font-medium">
          Showing {filteredCities.length} of {initialCities.length} cities
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCities.map((city, index) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
            >
              <div className="group relative bg-white dark:bg-black rounded-2xl shadow-soft overflow-hidden cursor-pointer hover:shadow-soft-xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
                {/* Favorite Button - Above everything */}
                <div className="absolute top-4 right-4 z-50">
                  <FavoriteButton cityId={city.id} size="sm" />
                </div>
                
                {/* Link - Covers content area */}
                <Link 
                  href={`/city/${city.slug}`} 
                  className="absolute inset-0 z-10 block" 
                  aria-label={`View ${city.name}`}
                />
                  {city.cover_square_url ? (
                    <div className="relative aspect-square overflow-hidden">
                      <Suspense fallback={<SkeletonLoader variant="image" />}>
                        <Image
                          src={city.cover_square_url}
                          alt={`${city.name} - CALI Sound Afro House | ${city.country} ${city.region}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                      </Suspense>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gradient-to-br from-gray-800 via-gray-900 to-black dark:from-gray-900 dark:via-black dark:to-gray-950 relative overflow-hidden group">
                      {/* Animated gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-amber-500/8 to-orange-500/15 animate-gradient opacity-60" />
                      
                      {/* Subtle grid pattern */}
                      <div 
                        className="absolute inset-0 opacity-[0.08]"
                        style={{
                          backgroundImage: `
                            linear-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
                          `,
                          backgroundSize: '25px 25px',
                        }}
                      />
                      
                      {/* City name initial - large and bold */}
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="text-white/40 dark:text-white/30 group-hover:text-white/60 dark:group-hover:text-white/50 transition-all duration-300">
                          <div className="text-7xl md:text-8xl font-black tracking-tighter drop-shadow-2xl">
                            {city.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Decorative circles */}
                      <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-orange-500/10 blur-xl" />
                      <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full bg-amber-500/10 blur-xl" />
                      
                      {/* Gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{city.country_flag}</span>
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">
                        {city.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        city.status === 'OUT_NOW'
                          ? 'bg-green-500 text-white'
                          : 'bg-yellow-500 text-white'
                      }`}>
                        {city.status === 'OUT_NOW' ? 'OUT NOW' : 'SOON'}
                      </span>
                      <span className="text-white/90 text-sm drop-shadow-md">{city.region}</span>
                    </div>
                  </div>
                </div>
            </motion.div>
          ))}
        </div>

        {filteredCities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No cities found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
