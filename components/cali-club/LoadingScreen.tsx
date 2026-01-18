'use client'

import { motion } from 'framer-motion'
import { MusicIcon } from './Icons'

export function LoadingScreen() {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-amber-500/10 animate-pulse" />
      
      <motion.div 
        className="text-center relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-amber-500/20 border-r-amber-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <MusicIcon className="text-yellow-500" size={32} />
          </div>
        </div>
        <motion.p 
          className="text-white text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading CALI Club...
        </motion.p>
        <p className="text-gray-500 text-sm mt-2">Virtual Concert Experience</p>
      </motion.div>
    </div>
  )
}
