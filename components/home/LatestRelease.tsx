'use client'

import Link from 'next/link'
import Image from 'next/image'
import { City } from '@/types/database'
import { motion } from 'framer-motion'
import { AudioWaveform } from '@/components/effects/AudioWaveform'

interface LatestReleaseProps {
  city: City | null
}

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  return match ? match[1] : null
}

export function LatestRelease({ city }: LatestReleaseProps) {
  if (!city) return null

  const videoId = city.youtube_full ? extractVideoId(city.youtube_full) : null

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
            Latest Release
          </h2>
          <p className="text-2xl text-gray-600 dark:text-gray-300 font-medium">
            Discover our newest city experience
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
          whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
          className="relative rounded-3xl overflow-hidden group border-glow"
        >
          {/* Glassmorphism Background */}
          <div className="absolute inset-0 bg-white/80 dark:bg-black/60 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-3xl" />
          {/* Shimmer Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer rounded-3xl" />
          
          {/* YouTube Video Iframe */}
          {videoId && (
            <div className="relative aspect-video overflow-hidden rounded-3xl mb-8 shadow-soft-xl">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title={city.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen={true}
                className="w-full h-full rounded-3xl"
              />
            </div>
          )}
          
          {/* Fallback: Banner Image if no video */}
          {!videoId && city.banner_16x9_url && (
            <>
              <Link href={`/city/${city.slug}`} className="absolute inset-0 z-10" aria-label={`View ${city.name}`} />
              <div className="relative h-64 md:h-96 overflow-hidden rounded-3xl">
                <Image
                  src={city.banner_16x9_url}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Audio Waveform Overlay */}
                <div className="absolute top-6 right-6 w-32 h-10 opacity-70 group-hover:opacity-100 transition-opacity">
                  <AudioWaveform 
                    width={128} 
                    height={40}
                    color="rgba(255, 255, 255, 0.9)"
                    bars={16}
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="relative z-10 p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl drop-shadow-lg">{city.country_flag}</span>
              <div>
                <h3 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-2">
                  {city.name}
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-300 font-semibold">{city.country}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {city.mood.map((m) => (
                <span
                  key={m}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white rounded-full text-sm font-bold shadow-lg capitalize"
                >
                  {m}
                </span>
              ))}
            </div>

            {city.description_en && (
              <p className="text-gray-700 dark:text-gray-200 text-xl line-clamp-3 mb-8 font-medium leading-relaxed break-words">
                {city.description_en}
              </p>
            )}

            <div className="flex gap-4">
              <Link href={`/city/${city.slug}`}>
                <motion.button
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="group/btn relative px-8 py-4 bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:from-orange-400/90 hover:to-amber-400/90 overflow-hidden border-glow"
                >
                  <span className="relative z-10">View City Page</span>
                  <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity shimmer" />
                </motion.button>
              </Link>
              {city.youtube_shorts && (
                <motion.a
                  href={city.youtube_shorts}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  whileHover={{ scale: 1.05, rotateY: -5 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="group/btn relative px-8 py-4 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/30 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-glow"
                >
                  <span className="relative z-10">Watch Shorts</span>
                  <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity shimmer" />
                </motion.a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
