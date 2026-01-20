'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [twoFACode, setTwoFACode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        setError(errorData.error || `Error ${response.status}: ${response.statusText}`)
        setLoading(false)
        return
      }

      const data = await response.json()

      if (data.success) {
        if (data.requires2FA) {
          setRequires2FA(true)
        } else {
          // Session cookies should be set in response
          // Wait a bit for cookies to be set, then redirect
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Force redirect to admin page
          window.location.href = '/admin'
        }
      } else {
        setError(data.error || 'Invalid password')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err?.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: twoFACode }),
      })

      const data = await response.json()

      if (data.success) {
        // 2FA verify route already creates session if needed
        // But we still need to call complete endpoint to clean up temp cookies
        try {
          const completeResponse = await fetch('/api/admin/login/complete', { 
            method: 'POST',
            credentials: 'include' // Important: include cookies
          })
          
          // Wait for cookies to be set
          await new Promise(resolve => setTimeout(resolve, 200))
          
          // Redirect to admin panel
          window.location.href = '/admin'
        } catch (completeError: any) {
          // If complete fails but verify succeeded, still try to redirect
          // (session might already be created by verify route)
          console.warn('Complete endpoint failed, but trying redirect anyway:', completeError)
          await new Promise(resolve => setTimeout(resolve, 200))
          window.location.href = '/admin'
        }
      } else {
        setError(data.error || 'Invalid verification code')
      }
    } catch (err: any) {
      console.error('2FA verification error:', err)
      setError(err?.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-black rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md border border-gray-200 dark:border-gray-800"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            CALI Sound Management
          </p>
        </div>

        {!requires2FA ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter admin password"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handle2FASubmit} className="space-y-6">
            <div>
              <label htmlFor="2fa" className="block text-sm font-semibold text-gray-900 dark:text-gray-300 mb-2">
                Two-Factor Authentication Code
              </label>
              <input
                id="2fa"
                type="text"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false)
                  setTwoFACode('')
                  setError('')
                }}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || twoFACode.length !== 6}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
