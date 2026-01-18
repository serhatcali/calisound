'use client'

import { GlobalLinks } from '@/types/database'
import { motion } from 'framer-motion'
import { trackClick } from '@/lib/db'
import { 
  YouTubeIcon, 
  SpotifyIcon, 
  AppleMusicIcon, 
  SoundCloudIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
  FacebookIcon
} from '@/components/icons/PlatformIcons'

interface LinksPageClientProps {
  links: GlobalLinks | null
}

const linkConfig = [
  { 
    key: 'youtube', 
    label: 'YouTube', 
    icon: YouTubeIcon,
    accentColor: 'text-red-500'
  },
  { 
    key: 'spotify', 
    label: 'Spotify', 
    icon: SpotifyIcon,
    accentColor: 'text-green-500'
  },
  { 
    key: 'apple_music', 
    label: 'Apple Music', 
    icon: AppleMusicIcon,
    accentColor: 'text-pink-500'
  },
  { 
    key: 'soundcloud', 
    label: 'SoundCloud', 
    icon: SoundCloudIcon,
    accentColor: 'text-orange-500'
  },
  { 
    key: 'instagram', 
    label: 'Instagram', 
    icon: InstagramIcon,
    accentColor: 'text-purple-500'
  },
  { 
    key: 'tiktok', 
    label: 'TikTok', 
    icon: TikTokIcon,
    accentColor: 'text-gray-300'
  },
  { 
    key: 'x', 
    label: 'X (Twitter)', 
    icon: XIcon,
    accentColor: 'text-gray-400'
  },
  { 
    key: 'facebook', 
    label: 'Facebook', 
    icon: FacebookIcon,
    accentColor: 'text-blue-500'
  },
]

export function LinksPageClient({ links }: LinksPageClientProps) {
  const handleClick = (type: string, url: string | null) => {
    if (url) {
      trackClick(type, url)
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  if (!links) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-950 dark:to-black flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">No links available.</p>
      </div>
    )
  }

  const availableLinks = linkConfig.filter(
    (config) => links[config.key as keyof GlobalLinks]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-950 dark:to-black py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
            CALI Sound
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
            Connect with us everywhere
          </p>
        </motion.div>

            <div className="space-y-3">
              {availableLinks.map((config, index) => {
                const url = links[config.key as keyof GlobalLinks] as string | null
                if (!url) return null

                const IconComponent = config.icon

                return (
                  <motion.button
                    key={config.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleClick(config.key, url)}
                    className="group w-full relative bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 dark:border-white/10 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between hover:bg-white/10 dark:hover:bg-white/10 hover:border-white/20 dark:hover:border-white/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`relative ${config.accentColor} transition-transform duration-300 group-hover:scale-110`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-gray-900 dark:text-white font-semibold text-lg group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                        {config.label}
                      </span>
                    </div>
                    <svg 
                      className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                )
              })}
            </div>

        {availableLinks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No links available.</p>
          </div>
        )}
      </div>
    </div>
  )
}
