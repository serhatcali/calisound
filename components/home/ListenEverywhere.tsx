'use client'

import { GlobalLinks } from '@/types/database'
import { motion } from 'framer-motion'
import { trackClick } from '@/lib/db'
import { MagneticButton } from '@/components/effects/MagneticButton'
import { SpotifyIcon, AppleMusicIcon, SoundCloudIcon, YouTubeIcon } from '@/components/icons/PlatformIcons'

interface ListenEverywhereProps {
  globalLinks: GlobalLinks | null
}

const platforms = [
  { 
    key: 'spotify', 
    label: 'Spotify', 
    icon: SpotifyIcon,
    gradient: 'from-green-500/10 via-emerald-500/5 to-green-500/10',
    hoverGradient: 'group-hover/btn:from-green-500/20 group-hover/btn:via-emerald-500/15 group-hover/btn:to-green-500/20',
    iconColor: 'text-green-400',
    iconHoverColor: 'group-hover/btn:text-green-300',
    glowColor: 'group-hover/btn:shadow-[0_0_30px_rgba(34,197,94,0.3)]'
  },
  { 
    key: 'apple_music', 
    label: 'Apple Music', 
    icon: AppleMusicIcon,
    gradient: 'from-pink-500/10 via-rose-500/5 to-pink-500/10',
    hoverGradient: 'group-hover/btn:from-pink-500/20 group-hover/btn:via-rose-500/15 group-hover/btn:to-pink-500/20',
    iconColor: 'text-pink-400',
    iconHoverColor: 'group-hover/btn:text-pink-300',
    glowColor: 'group-hover/btn:shadow-[0_0_30px_rgba(236,72,153,0.3)]'
  },
  { 
    key: 'soundcloud', 
    label: 'SoundCloud', 
    icon: SoundCloudIcon,
    gradient: 'from-orange-500/10 via-amber-500/5 to-orange-500/10',
    hoverGradient: 'group-hover/btn:from-orange-500/20 group-hover/btn:via-amber-500/15 group-hover/btn:to-orange-500/20',
    iconColor: 'text-orange-400',
    iconHoverColor: 'group-hover/btn:text-orange-300',
    glowColor: 'group-hover/btn:shadow-[0_0_30px_rgba(249,115,22,0.3)]'
  },
  { 
    key: 'youtube', 
    label: 'YouTube Music', 
    icon: YouTubeIcon,
    gradient: 'from-red-500/10 via-rose-500/5 to-red-500/10',
    hoverGradient: 'group-hover/btn:from-red-500/20 group-hover/btn:via-rose-500/15 group-hover/btn:to-red-500/20',
    iconColor: 'text-red-400',
    iconHoverColor: 'group-hover/btn:text-red-300',
    glowColor: 'group-hover/btn:shadow-[0_0_30px_rgba(239,68,68,0.3)]'
  },
]

export function ListenEverywhere({ globalLinks }: ListenEverywhereProps) {
  const handleClick = (platform: string, url: string | null) => {
    if (url) {
      trackClick(platform, url)
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  if (!globalLinks) return null

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:from-black dark:via-gray-950 dark:to-black relative overflow-hidden">
      {/* Animated Orange/Amber Background */}
      <div className="absolute inset-0 opacity-60 dark:opacity-40">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(251, 146, 60, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(249, 115, 22, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.3) 0%, transparent 60%),
              radial-gradient(circle at 10% 80%, rgba(255, 165, 0, 0.3) 0%, transparent 50%)
            `,
            animation: 'gradientShift 8s ease infinite',
          }}
        />
      </div>
      
      {/* Geometric Shapes */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-64 h-64 bg-orange-500/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-glow-pulse" />
      </div>
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl">
            Listen Everywhere
          </h2>
          <p className="text-2xl text-white/90 font-medium">
            Stream CALI Sound on your favorite platform
          </p>
        </motion.div>

            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 max-w-5xl mx-auto">
              {platforms.map((platform, index) => {
                const url = globalLinks[platform.key as keyof GlobalLinks] as string | null
                if (!url) return null

                const IconComponent = platform.icon

                return (
                  <MagneticButton key={platform.key} strength={0.1}>
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.08,
                        ease: "easeOut"
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        y: -4,
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleClick(platform.key, url)}
                      className={`group/btn relative bg-white/[0.05] dark:bg-white/[0.05] backdrop-blur-xl border border-white/15 dark:border-white/15 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${platform.glowColor} w-[140px] h-[140px] md:w-[160px] md:h-[160px] flex items-center justify-center`}
                    >
                      {/* Static gradient background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300`} />
                      
                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center justify-center gap-3 md:gap-4 w-full px-2">
                        {/* Icon */}
                        <div className={`${platform.iconColor} ${platform.iconHoverColor} transition-all duration-300 flex-shrink-0`}>
                          <IconComponent className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        
                        {/* Label */}
                        <span className="text-white/90 dark:text-white/90 font-semibold text-xs md:text-sm text-center group-hover/btn:text-white transition-colors duration-300 leading-tight">
                          {platform.label}
                        </span>
                      </div>
                    </motion.button>
                  </MagneticButton>
                )
              })}
            </div>
      </div>
    </section>
  )
}
