'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { GlobalLinks } from '@/types/database'
import { trackClick } from '@/lib/db'
import { Particles } from '@/components/effects/Particles'
import { MagneticButton } from '@/components/effects/MagneticButton'
import { useSiteContent } from '@/hooks/use-site-content'

interface HeroProps {
  globalLinks: GlobalLinks | null
}

export function Hero({ globalLinks }: HeroProps) {
  const { content: heroContent } = useSiteContent(['hero_title', 'hero_subtitle', 'hero_description', 'hero_cta'])
  
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start']
  })
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])
  
  // Fallback values
  const heroTitle = heroContent.hero_title || 'CALI Sound - Global Afro House City Series'
  const heroSubtitle = heroContent.hero_subtitle || 'Experience the world through Afro House music'
  const heroDescription = heroContent.hero_description || 'CALI Sound brings you city-inspired melodic club music from around the globe.'
  const heroCta = heroContent.hero_cta || 'Explore Cities'

  const handleClick = (type: string, url: string | null) => {
    if (url) {
      trackClick(type, url)
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden -mt-16 md:-mt-20"
    >
      {/* Full-Screen Video Background */}
      <div className="hero-video">
        {/* Mobile video - shown on screens smaller than 768px */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="hero-video-element hero-video-mobile"
        >
          <source src="/caliweb-mobile.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Desktop video - shown on screens 768px and larger */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="hero-video-element hero-video-desktop"
        >
          <source src="/caliweb.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Fallback gradient overlay for when video is loading or unavailable */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:from-black dark:via-gray-950 dark:to-black opacity-20" />
      </div>

      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/40 z-[1]" />

      <motion.div 
        style={{ opacity, scale, y }}
        className="relative z-[10] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-tight">
              <span className="block bg-gradient-to-r from-white via-primary-100 to-accent-100 dark:from-gray-200 dark:via-gray-100 dark:to-gray-200 bg-clip-text text-transparent animate-gradient">
                CALI
              </span>
              <span className="block text-white text-5xl md:text-7xl lg:text-8xl font-extrabold mt-2">
                {heroTitle.split(' - ')[1] || heroTitle}
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-3xl text-white/90 dark:text-gray-100 mb-12 max-w-4xl mx-auto font-medium leading-relaxed"
          >
            {heroDescription}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          >
            {globalLinks?.youtube && (
              <MagneticButton strength={0.2}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleClick('youtube', globalLinks.youtube)}
                  className="group relative px-10 py-5 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl font-bold text-lg text-white shadow-2xl hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300 overflow-hidden border-glow"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Watch on YouTube
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/40 to-amber-400/40 dark:from-orange-500/50 dark:to-amber-500/50 opacity-0 group-hover:opacity-100 transition-opacity shimmer" />
                </motion.button>
              </MagneticButton>
            )}
            {globalLinks?.spotify && (
              <MagneticButton strength={0.2}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleClick('spotify', globalLinks.spotify)}
                  className="group relative px-10 py-5 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl font-bold text-lg text-white shadow-2xl hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300 overflow-hidden border-glow"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.419.34-.66.72-.84 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    Listen on Spotify
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/40 to-orange-400/40 dark:from-amber-500/50 dark:to-orange-500/50 opacity-0 group-hover:opacity-100 transition-opacity shimmer" />
                </motion.button>
              </MagneticButton>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

    </section>
  )
}
