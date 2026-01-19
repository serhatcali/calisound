'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  getCookieConsent,
  setCookieConsent,
  getCookiePreferences,
  setCookiePreferences,
  type CookiePreferences,
} from '@/lib/cookies'
import { useSiteContent } from '@/hooks/use-site-content'

export function CookieConsent() {
  const { content: cookieContent } = useSiteContent(['cookie_title', 'cookie_description', 'cookie_accept', 'cookie_decline'])
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })
  
  // Fallback values
  const title = cookieContent.cookie_title || 'Cookie Preferences'
  const description = cookieContent.cookie_description || 'We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.'
  const acceptText = cookieContent.cookie_accept || 'Accept All'
  const declineText = cookieContent.cookie_decline || 'Reject All'

  useEffect(() => {
    const hasConsented = getCookieConsent()
    if (!hasConsented) {
      setShowBanner(true)
    }
    setPreferences(getCookiePreferences())
  }, [])

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    setCookiePreferences(allAccepted)
    setCookieConsent(true)
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    setCookiePreferences(onlyNecessary)
    setCookieConsent(true)
    setShowBanner(false)
  }

  const handleSavePreferences = () => {
    setCookiePreferences(preferences)
    setCookieConsent(true)
    setShowBanner(false)
    setShowSettings(false)
  }

  const togglePreference = (category: keyof CookiePreferences) => {
    if (category === 'necessary') return // Can't disable necessary
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  if (!showBanner) return null

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-black rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
              {!showSettings ? (
                <>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm md:text-base">
                    {description}{' '}
                    <Link href="/cookie-policy" className="text-orange-500 hover:text-orange-600 underline">
                      Learn more
                    </Link>
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAcceptAll}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white rounded-xl font-semibold hover:from-orange-400/90 hover:to-amber-400/90 transition-all shadow-soft"
                    >
                      {acceptText}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowSettings(true)}
                      className="px-6 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Customize
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRejectAll}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {declineText}
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Cookie Settings
                  </h3>

                  <div className="space-y-4 mb-6">
                    {/* Necessary Cookies */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Necessary Cookies
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Essential for the website to function properly. Cannot be disabled.
                        </p>
                      </div>
                      <div className="ml-4 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                        Always On
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Analytics Cookies
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Help us understand how visitors interact with our website.
                        </p>
                      </div>
                      <button
                        onClick={() => togglePreference('analytics')}
                        className={`ml-4 w-14 h-8 rounded-full transition-colors ${
                          preferences.analytics
                            ? 'bg-orange-500'
                            : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                            preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Marketing Cookies
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Used to deliver personalized advertisements and track campaign performance.
                        </p>
                      </div>
                      <button
                        onClick={() => togglePreference('marketing')}
                        className={`ml-4 w-14 h-8 rounded-full transition-colors ${
                          preferences.marketing
                            ? 'bg-orange-500'
                            : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                            preferences.marketing ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSavePreferences}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500/80 to-amber-500/80 dark:from-orange-500/70 dark:to-amber-500/70 text-white rounded-xl font-semibold hover:from-orange-400/90 hover:to-amber-400/90 transition-all shadow-soft"
                    >
                      Save Preferences
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowSettings(false)}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Back
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
