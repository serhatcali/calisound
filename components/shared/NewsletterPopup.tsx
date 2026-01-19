'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { NewsletterForm } from './NewsletterForm'

const STORAGE_KEY = 'newsletter-popup-dismissed'

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Don't show on admin pages (including login)
    if (pathname?.startsWith('/admin')) {
      return
    }

    // Check if user has dismissed the popup
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2000) // 2 seconds delay
      return () => clearTimeout(timer)
    }
  }, [pathname])

  const handleClose = () => {
    setIsOpen(false)
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
  }

  const handleSuccess = () => {
    // Close popup after successful subscription
    setTimeout(() => {
      handleClose()
    }, 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-black rounded-3xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 overflow-hidden relative">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-10"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content */}
              <div className="p-8 md:p-10">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">🎵</div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                    Stay Updated
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get notified when new cities are released
                  </p>
                </div>

                {/* Newsletter Form */}
                <div className="mb-6">
                  <NewsletterForm onSuccess={handleSuccess} />
                </div>

                {/* Don't Show Again Checkbox */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <input
                    type="checkbox"
                    id="dont-show-again"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 focus:ring-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  />
                  <label
                    htmlFor="dont-show-again"
                    className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
                  >
                    Don&apos;t show this again
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
