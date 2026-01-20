'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { City } from '@/types/database'
import { motion } from 'framer-motion'
import { AudioWaveform } from '@/components/effects/AudioWaveform'
import { SkeletonLoader } from '@/components/shared/SkeletonLoader'

interface CityGridProps {
  cities: City[]
}

export function CityGrid({ cities }: CityGridProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent px-4">
            Explore Cities
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium px-4">
            Discover Afro House experiences from around the world
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 px-4 sm:px-0">
          {cities.map((city, index) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 30, rotateX: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.5) }}
              style={{ 
                transformStyle: 'preserve-3d', 
                perspective: '1000px',
                contain: 'layout style'
              }}
              className="group relative rounded-3xl overflow-hidden cursor-pointer border-glow city-grid-item"
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                rotateX: -5,
                z: 50,
              }}
            >
              {/* Glassmorphism Card */}
              <div className="absolute inset-0 bg-white/10 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl" />
              
              {/* Shimmer Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer rounded-3xl" />
              
              {city.cover_square_url ? (
                <div className="relative aspect-square overflow-hidden rounded-3xl">
                  <Suspense fallback={<SkeletonLoader variant="image" />}>
                    <Image
                      src={city.cover_square_url}
                      alt={`${city.name} - CALI Sound Afro House | ${city.country} ${city.region}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-125 transition-transform duration-700"
                      loading={index < 4 ? "eager" : "lazy"}
                      priority={index < 4}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  </Suspense>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Audio Waveform Overlay */}
                  <div className="absolute top-4 right-4 w-24 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                    <AudioWaveform 
                      width={96} 
                      height={32}
                      color="rgba(255, 255, 255, 0.9)"
                      bars={12}
                    />
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-gray-800 via-gray-900 to-black dark:from-gray-900 dark:via-black dark:to-gray-950 rounded-3xl relative overflow-hidden group">
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
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl drop-shadow-lg">{city.country_flag}</span>
                  <h3 className="text-2xl font-black text-white drop-shadow-lg">
                    {city.name}
                  </h3>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    city.status === 'OUT_NOW'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-yellow-500 text-white shadow-lg'
                  }`}>
                    {city.status === 'OUT_NOW' ? 'OUT NOW' : 'SOON'}
                  </span>
                  <span className="text-white/90 text-sm font-medium">{city.region}</span>
                </div>
              </div>
              
              {/* Invisible Link Overlay */}
              <Link href={`/city/${city.slug}`} className="absolute inset-0 z-10" aria-label={`View ${city.name}`} />
                  
              {/* 3D Glow Effect */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-orange-400/30 via-amber-400/30 to-orange-400/30 dark:from-orange-500/40 dark:via-amber-500/40 dark:to-orange-500/40 blur-xl" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link href="/cities">
            <motion.button
              whileHover={{ scale: 1.1, rotateY: 5 }}
              whileTap={{ scale: 0.95 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="px-10 py-5 bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-sm border border-white/20 hover:from-orange-400/90 hover:to-amber-400/90"
            >
              View All Cities
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
