'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface NewsletterFormProps {
  onSuccess?: () => void
}

export function NewsletterForm({ onSuccess }: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setEmail('')
        setTimeout(() => setSuccess(false), 5000)
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1500)
        }
      } else {
        setError(data.error || 'Failed to subscribe')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-900/30 border border-green-700 rounded-2xl p-6 text-center"
      >
        <div className="text-4xl mb-2">✅</div>
        <p className="text-green-300 font-semibold">
          Successfully subscribed!
        </p>
        <p className="text-sm text-green-400 mt-1">
          Check your email for confirmation
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 w-full max-w-xs mx-auto lg:mx-0">
      <div className="flex flex-col gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-400 text-center lg:text-left">{error}</p>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center lg:text-left">
        Get notified when new cities are released
      </p>
    </form>
  )
}
