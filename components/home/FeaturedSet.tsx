'use client'

import { Set } from '@/types/database'
import { motion } from 'framer-motion'

interface FeaturedSetProps {
  set: Set
}

export function FeaturedSet({ set }: FeaturedSetProps) {
  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  const videoId = set.youtube_embed ? extractVideoId(set.youtube_embed) : null

  return (
    <section className="py-24 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
            Featured DJ Set
          </h2>
          <p className="text-2xl text-gray-600 dark:text-gray-300 font-medium">
            {set.duration && `Duration: ${set.duration}`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotateX: -10 }}
          whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          whileHover={{ 
            scale: 1.01,
            rotateY: 2,
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative rounded-3xl p-8 md:p-12 overflow-hidden"
        >
          {/* Glassmorphism Background */}
          <div className="absolute inset-0 bg-gray-50/80 dark:bg-gray-900/40 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl" />
          
          <div className="relative z-10">
            <h3 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-8">
              {set.title}
            </h3>

            {videoId && (
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 shadow-soft-xl">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={set.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            )}

            {set.description && (
              <p className="text-gray-900 dark:text-gray-300 text-lg mb-6">
                {set.description}
              </p>
            )}

            {set.chapters && (
              <div className="bg-gray-100/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-white/10">
                <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-4">Chapters</h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 font-mono">
                  {set.chapters.split('\n').map((chapter, index) => (
                    <div key={index}>{chapter}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
