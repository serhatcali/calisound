'use client'

import Image from 'next/image'
import Link from 'next/link'
import { City } from '@/types/database'
import { motion } from 'framer-motion'
import { CountdownTimer } from '@/components/city/CountdownTimer'
import { CopyTools } from '@/components/city/CopyTools'
import { SocialShare } from '@/components/shared/SocialShare'
import { FavoriteButton } from '@/components/shared/FavoriteButton'
import { PlaylistButton } from '@/components/shared/PlaylistButton'
import { Comments } from '@/components/shared/Comments'
import { ViewCount } from '@/components/shared/ViewCount'
import { trackClick } from '@/lib/db'

interface CityPageClientProps {
  city: City
  relatedCities: City[]
}

export function CityPageClient({ city, relatedCities }: CityPageClientProps) {
  const handleLinkClick = (type: string, url: string | null) => {
    if (url) {
      trackClick(type, url)
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  // Use banner image as default, fallback to square if banner not available
  const currentImage = city.banner_16x9_url || city.cover_square_url
  const imageAspect = city.banner_16x9_url ? 'aspect-video' : 'aspect-square'

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Banner Section */}
      <section className="relative">
        {currentImage ? (
          <div className={`relative ${imageAspect} overflow-hidden`}>
            <Image
              src={currentImage}
              alt={`CALI Sound - ${city.name} | Afro House Music | ${city.country} ${city.region}`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>
        ) : (
          <div className={`relative ${imageAspect} bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-900 dark:to-black overflow-hidden`}>
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-orange-500/10 animate-gradient" />
            
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px',
              }}
            />
            
            {/* City icon placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white/20 dark:text-white/10">
                <svg className="w-24 h-24 md:w-32 md:h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}

        {/* Favorite & Playlist Buttons */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <PlaylistButton
            id={city.id}
            type="city"
            name={city.name}
            url={`/city/${city.slug}`}
            image={currentImage || undefined}
          />
          <FavoriteButton cityId={city.id} size="md" />
        </div>

        {/* Minimal City Info Overlay - Only Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-3xl md:text-4xl">{city.country_flag}</span>
              <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-2xl">
                {city.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* City Meta Info - Moved from banner */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                {city.country} • {city.region}
              </p>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                city.status === 'OUT_NOW'
                  ? 'bg-green-500 text-white'
                  : 'bg-yellow-500 text-white'
              }`}>
                {city.status === 'OUT_NOW' ? 'OUT NOW' : 'SOON'}
              </span>
              {city.youtube_full && (
                <ViewCount youtubeUrl={city.youtube_full} />
              )}
            </div>
            
            {city.mood.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {city.mood.map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-300 rounded-full text-sm font-medium capitalize"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}

            {city.status === 'SOON' && city.release_datetime && (
              <div className="mb-6">
                <CountdownTimer releaseDate={city.release_datetime} />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            {city.youtube_full && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLinkClick('youtube_full', city.youtube_full)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white rounded-xl font-semibold hover:from-orange-400/90 hover:to-amber-400/90 transition-all shadow-soft"
              >
                YouTube Full
              </motion.button>
            )}
            {city.youtube_shorts && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLinkClick('youtube_shorts', city.youtube_shorts)}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-soft"
              >
                YouTube Shorts
              </motion.button>
            )}
            {city.instagram && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLinkClick('instagram', city.instagram)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-soft"
              >
                Instagram
              </motion.button>
            )}
            {city.tiktok && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLinkClick('tiktok', city.tiktok)}
                className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-soft"
              >
                TikTok
              </motion.button>
            )}
          </div>

          {/* Social Share */}
          <div className="mb-12">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Share</h3>
            <SocialShare 
              url={`/city/${city.slug}`}
              title={`CALI Sound - ${city.name}`}
              description={`Experience ${city.name} through Afro House music`}
            />
          </div>

          {/* Descriptions */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {city.description_en && (
              <div className="bg-white dark:bg-black rounded-2xl p-8 border border-gray-100 dark:border-gray-900">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">English</h2>
                <p className="text-gray-900 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line break-words overflow-wrap-anywhere">
                  {city.description_en}
                </p>
              </div>
            )}
            {city.description_local && (
              <div className="bg-white dark:bg-black rounded-2xl p-8 border border-gray-100 dark:border-gray-900">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Local Language</h2>
                <p className="text-gray-900 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line break-words overflow-wrap-anywhere">
                  {city.description_local}
                </p>
              </div>
            )}
          </div>

          {/* Copy Tools */}
          <CopyTools city={city} />

          {/* Comments */}
          <div className="mt-16">
            <Comments entityType="city" entityId={city.id} />
          </div>

          {/* Related Cities */}
          {relatedCities.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Related Cities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedCities.map((relatedCity) => (
                  <motion.div
                    key={relatedCity.id}
                    whileHover={{ scale: 1.05 }}
                    className="group relative bg-white dark:bg-black rounded-2xl shadow-soft overflow-hidden cursor-pointer hover:shadow-soft-xl transition-all duration-300 border border-gray-100 dark:border-gray-900"
                  >
                    <Link href={`/city/${relatedCity.slug}`} className="absolute inset-0 z-10" aria-label={`View ${relatedCity.name}`} />
                      {relatedCity.cover_square_url ? (
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            src={relatedCity.cover_square_url}
                            alt={relatedCity.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>
                      ) : (
                        <div className="aspect-square bg-gradient-to-br from-primary-200 to-accent-200" />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{relatedCity.country_flag}</span>
                          <h3 className="text-lg font-bold text-white">
                            {relatedCity.name}
                          </h3>
                        </div>
                      </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
