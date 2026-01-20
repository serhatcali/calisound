'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Log helper that saves to localStorage
const logToStorage = (message: string, data?: any) => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    message,
    data: data ? JSON.parse(JSON.stringify(data)) : null,
  }
  
  try {
    const existingLogs = JSON.parse(localStorage.getItem('admin-login-logs') || '[]')
    existingLogs.push(logEntry)
    // Keep only last 100 logs
    if (existingLogs.length > 100) {
      existingLogs.shift()
    }
    localStorage.setItem('admin-login-logs', JSON.stringify(existingLogs))
  } catch (e) {
    console.error('Failed to save log:', e)
  }
  
  console.log(`[${timestamp}] ${message}`, data || '')
}

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [twoFACode, setTwoFACode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const [logs, setLogs] = useState<any[]>([])

  // Load logs from localStorage on mount
  useEffect(() => {
    try {
      const savedLogs = JSON.parse(localStorage.getItem('admin-login-logs') || '[]')
      setLogs(savedLogs)
    } catch (e) {
      console.error('Failed to load logs:', e)
    }
  }, [])

  // Clear logs function
  const clearLogs = () => {
    localStorage.removeItem('admin-login-logs')
    setLogs([])
  }

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

    logToStorage('[Login Page] Starting 2FA verification...')

    try {
      logToStorage('[Login Page] Calling /api/admin/2fa/verify', { tokenPreview: twoFACode.substring(0, 2) + '****' })
      const response = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({ token: twoFACode }),
      })

      logToStorage('[Login Page] 2FA verify response', { status: response.status, statusText: response.statusText })
      const data = await response.json()
      logToStorage('[Login Page] 2FA verify response data', { success: data.success, error: data.error })

      if (data.success) {
        logToStorage('[Login Page] 2FA verified successfully, calling /api/admin/login/complete')
        // 2FA verify route already creates session if needed
        // But we still need to call complete endpoint to clean up temp cookies
        try {
          const completeResponse = await fetch('/api/admin/login/complete', { 
            method: 'POST',
            credentials: 'include' // Important: include cookies
          })
          
          logToStorage('[Login Page] Complete response', { status: completeResponse.status, statusText: completeResponse.statusText })
          const completeData = await completeResponse.json().catch(() => ({}))
          logToStorage('[Login Page] Complete response data', completeData)
          
          // Check cookies after complete
          logToStorage('[Login Page] Cookies after complete', { cookies: document.cookie })
          
          // Wait for cookies to be set
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Check auth status before redirect
          logToStorage('[Login Page] Checking auth status before redirect...')
          const authCheck = await fetch('/api/admin/login/check', { credentials: 'include' })
          const authData = await authCheck.json()
          logToStorage('[Login Page] Auth check result', authData)
          
          // Update logs state
          try {
            const savedLogs = JSON.parse(localStorage.getItem('admin-login-logs') || '[]')
            setLogs(savedLogs)
          } catch (e) {}
          
          // Redirect to admin panel
          logToStorage('[Login Page] Redirecting to /admin')
          window.location.href = '/admin'
        } catch (completeError: any) {
          // If complete fails but verify succeeded, still try to redirect
          // (session might already be created by verify route)
          logToStorage('[Login Page] Complete endpoint error', { error: completeError.message, stack: completeError.stack })
          logToStorage('[Login Page] Checking auth status anyway...')
          const authCheck = await fetch('/api/admin/login/check', { credentials: 'include' })
          const authData = await authCheck.json()
          logToStorage('[Login Page] Auth check result', authData)
          
          // Update logs state
          try {
            const savedLogs = JSON.parse(localStorage.getItem('admin-login-logs') || '[]')
            setLogs(savedLogs)
          } catch (e) {}
          
          await new Promise(resolve => setTimeout(resolve, 300))
          logToStorage('[Login Page] Redirecting to /admin despite complete error')
          window.location.href = '/admin'
        }
      } else {
        logToStorage('[Login Page] 2FA verification failed', { error: data.error })
        setError(data.error || 'Invalid verification code')
      }
    } catch (err: any) {
      logToStorage('[Login Page] 2FA verification exception', { error: err.message, stack: err.stack })
      setError(err?.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* Debug Logs Panel */}
      {logs.length > 0 && (
        <div className="fixed top-4 right-4 w-96 max-h-96 overflow-auto bg-black/90 text-white text-xs p-4 rounded-lg border border-gray-700 z-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Debug Logs ({logs.length})</h3>
            <button
              onClick={clearLogs}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1">
            {logs.slice(-20).reverse().map((log, idx) => (
              <div key={idx} className="border-b border-gray-700 pb-1">
                <div className="text-gray-400 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</div>
                <div className="text-white">{log.message}</div>
                {log.data && (
                  <pre className="text-gray-300 text-xs mt-1 overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
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
