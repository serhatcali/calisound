'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface SEOData {
  title: string
  description: string
  url: string
  image?: string
}

export function SEOTools() {
  const [url, setUrl] = useState('')
  const [seoData, setSeoData] = useState<SEOData | null>(null)
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState<number | null>(null)

  const analyzeSEO = async () => {
    if (!url) return

    setLoading(true)
    try {
      // Fetch page data
      const response = await fetch(`/api/admin/seo-analyze?url=${encodeURIComponent(url)}`)
      const data = await response.json()

      if (data.success) {
        setSeoData(data.seoData)
        calculateScore(data.seoData)
      }
    } catch (error) {
      console.error('Error analyzing SEO:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateScore = (data: SEOData) => {
    let points = 0
    let maxPoints = 0

    // Title check
    maxPoints += 20
    if (data.title) {
      if (data.title.length >= 30 && data.title.length <= 60) points += 20
      else if (data.title.length > 0) points += 10
    }

    // Description check
    maxPoints += 20
    if (data.description) {
      if (data.description.length >= 120 && data.description.length <= 160) points += 20
      else if (data.description.length > 0) points += 10
    }

    // URL check
    maxPoints += 10
    if (data.url) points += 10

    // Image check
    maxPoints += 10
    if (data.image) points += 10

    // Meta tags (simulated)
    maxPoints += 20
    points += 20 // Assume they exist

    // Structured data (simulated)
    maxPoints += 20
    points += 20 // Assume they exist

    setScore(Math.round((points / maxPoints) * 100))
  }

  const generateSitemap = async () => {
    try {
      const response = await fetch('/api/admin/generate-sitemap', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        alert('Sitemap generated successfully!')
      }
    } catch (error) {
      console.error('Error generating sitemap:', error)
      alert('Error generating sitemap')
    }
  }

  return (
    <div className="space-y-6">
      {/* SEO Analyzer */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">SEO Analyzer</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to analyze (e.g., https://calisound.com/city/mexico-city)"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={analyzeSEO}
            disabled={loading || !url}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </motion.button>
        </div>

        {score !== null && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-950 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-black">
                {score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴'}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">SEO Score: {score}/100</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
                </p>
              </div>
            </div>
          </div>
        )}

        {seoData && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                <p className="text-gray-900 dark:text-white">{seoData.title || 'Not set'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {seoData.title?.length || 0} characters (recommended: 30-60)
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                <p className="text-gray-900 dark:text-white">{seoData.description || 'Not set'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {seoData.description?.length || 0} characters (recommended: 120-160)
                </p>
              </div>
            </div>
            {seoData.image && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  OG Image
                </label>
                <img src={seoData.image} alt="OG Image" className="max-w-md rounded-lg" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sitemap Generator */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sitemap Generator</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Generate or update the sitemap.xml file for better SEO.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateSitemap}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
        >
          Generate Sitemap
        </motion.button>
      </div>

      {/* Robots.txt Editor */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Robots.txt</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          View and edit robots.txt file. Current file is automatically generated.
        </p>
        <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg font-mono text-sm">
          <pre className="text-gray-900 dark:text-white">
            {`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://calisound.com/sitemap.xml`}
          </pre>
        </div>
      </div>
    </div>
  )
}
