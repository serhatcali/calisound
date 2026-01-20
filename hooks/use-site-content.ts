'use client'

import { useState, useEffect, useMemo } from 'react'

interface SiteContentMap {
  [key: string]: string
}

// Fallback content to prevent layout shift
const FALLBACK_CONTENT: SiteContentMap = {
  hero_title: 'CALI Sound - Global Afro House City Series',
  hero_subtitle: 'Experience the world through Afro House music',
  hero_description: 'CALI Sound brings you city-inspired melodic club music from around the globe.',
  hero_cta: 'Explore Cities',
}

/**
 * Hook to fetch and use site content on client side
 * Returns fallback content immediately to prevent layout shift
 */
export function useSiteContent(keys: string[] = [], locale: string = 'en') {
  // Initialize with fallback content to prevent layout shift
  const initialContent = useMemo(() => {
    const fallback: SiteContentMap = {}
    keys.forEach(key => {
      if (FALLBACK_CONTENT[key]) {
        fallback[key] = FALLBACK_CONTENT[key]
      }
    })
    return fallback
  }, [keys.join(',')])
  
  const [content, setContent] = useState<SiteContentMap>(initialContent)
  const [loading, setLoading] = useState(false) // Start as false since we have fallbacks

  useEffect(() => {
    async function fetchContent() {
      if (keys.length === 0) {
        return
      }

      // Set loading only after initial render
      setLoading(true)

      try {
        const response = await fetch(`/api/site-content?keys=${keys.join(',')}&locale=${locale}`)
        const data = await response.json()

        if (data.success) {
          // Merge with fallbacks to ensure no empty content
          setContent({ ...initialContent, ...data.content })
        }
      } catch (error) {
        console.error('Error fetching site content:', error)
        // Keep fallback content on error
      } finally {
        setLoading(false)
      }
    }

    // Delay fetch slightly to allow initial render
    const timeoutId = setTimeout(fetchContent, 0)
    return () => clearTimeout(timeoutId)
  }, [keys.join(','), locale, initialContent])

  return { content, loading }
}

/**
 * Hook to get a single content value
 */
export function useSiteContentValue(key: string, locale: string = 'en', fallback: string = '') {
  const { content, loading } = useSiteContent([key], locale)
  return { value: content[key] || fallback, loading }
}
