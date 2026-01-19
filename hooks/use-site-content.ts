'use client'

import { useState, useEffect } from 'react'

interface SiteContentMap {
  [key: string]: string
}

/**
 * Hook to fetch and use site content on client side
 */
export function useSiteContent(keys: string[] = [], locale: string = 'en') {
  const [content, setContent] = useState<SiteContentMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      if (keys.length === 0) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/site-content?keys=${keys.join(',')}&locale=${locale}`)
        const data = await response.json()

        if (data.success) {
          setContent(data.content)
        }
      } catch (error) {
        console.error('Error fetching site content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [keys.join(','), locale])

  return { content, loading }
}

/**
 * Hook to get a single content value
 */
export function useSiteContentValue(key: string, locale: string = 'en', fallback: string = '') {
  const { content, loading } = useSiteContent([key], locale)
  return { value: content[key] || fallback, loading }
}
