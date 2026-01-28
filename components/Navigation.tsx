'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { GlobalSearch } from '@/components/shared/GlobalSearch'

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/cities', label: 'Cities' },
    { href: '/sets', label: 'Sets' },
    { href: '/links', label: 'Links' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' },
  ]

  // Prevent hydration mismatch by using default classes until mounted
  const navClasses = mounted && scrolled
    ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-lg dark:shadow-xl border-b border-gray-200/50 dark:border-gray-800/50'
    : 'bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-900'

  return (
    <nav
      className={`sticky top-0 z-[100] transition-all duration-300 ${navClasses}`}
      style={{ minHeight: '64px', contain: 'layout style', isolation: 'isolate' }}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-[100]">
        <div className="flex justify-between items-center h-16 md:h-20" style={{ minHeight: '64px' }}>
          <div className="flex items-center space-x-2 group">
            <Link href="/" className="transition-transform duration-300 group-hover:scale-105 active:scale-95 relative z-10">
              <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 dark:from-gray-200 dark:via-white dark:to-gray-200 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                CALI
              </span>
            </Link>
            <span className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-semibold group-hover:text-gray-900 dark:group-hover:text-white transition-colors relative z-10">
              Sound
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-6 relative z-10">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <div
                    key={item.href}
                    className="relative group"
                  >
                    {/* Active background pill - behind link, no pointer events */}
                    {isActive && (
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-orange-500/90 to-amber-500/90 dark:from-orange-500/80 dark:to-amber-500/80 rounded-xl shadow-lg transition-all duration-300 pointer-events-none"
                        aria-hidden
                      />
                    )}
                    {/* Hover background - behind link, no pointer events */}
                    {!isActive && (
                      <div
                        className="absolute inset-0 bg-gray-100/50 dark:bg-gray-900/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        aria-hidden
                      />
                    )}
                    <Link
                      href={item.href}
                      className={`relative z-10 block px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-xl hover:-translate-y-0.5 ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-900 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* Theme Toggle - Desktop only */}
            {mounted && (
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                className="hidden md:flex relative p-2.5 rounded-xl bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-200/80 dark:hover:bg-gray-800/80 transition-all duration-300 shadow-sm hover:shadow-md"
                aria-label="Toggle theme"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'dark' ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </motion.div>
              </motion.button>
            )}

            {/* Global Search - En sağda */}
            <GlobalSearch />

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2.5 rounded-xl bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-800/80 transition-all duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <motion.div
                animate={mobileMenuOpen ? { rotate: 90 } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden border-t border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-black/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500/90 to-amber-500/90 dark:from-orange-500/80 dark:to-amber-500/80 text-white shadow-lg'
                          : 'text-gray-900 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-900/80'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}
              
              {/* Theme Toggle - Mobile */}
              {mounted && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.05 }}
                >
                  <button
                    onClick={() => {
                      toggleTheme()
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-900 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-900/80 transition-all duration-300"
                    aria-label="Toggle theme"
                  >
                    <span>Theme</span>
                    <motion.div
                      initial={false}
                      animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      {theme === 'dark' ? (
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                      )}
                    </motion.div>
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
