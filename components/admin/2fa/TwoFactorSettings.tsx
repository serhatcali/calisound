'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TwoFactorSetup } from './TwoFactorSetup'

export function TwoFactorSettings() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    check2FAStatus()
  }, [])

  const check2FAStatus = async () => {
    try {
      const response = await fetch('/api/admin/2fa/status')
      const data = await response.json()
      if (data.success) {
        setEnabled(data.enabled)
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/2fa/disable', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        setEnabled(false)
        alert('2FA has been disabled')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error)
      alert('Error disabling 2FA')
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset 2FA? This will completely remove your 2FA setup and you will need to set it up again from scratch.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/2fa/reset', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        setEnabled(false)
        setShowSetup(false)
        alert('2FA has been reset. You can now set it up again.')
        // Optionally show setup form
        setTimeout(() => {
          setShowSetup(true)
        }, 1000)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error resetting 2FA:', error)
      alert('Error resetting 2FA')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  if (showSetup) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
        <TwoFactorSetup
          onComplete={() => {
            setShowSetup(false)
            setEnabled(true)
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Two-Factor Authentication
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {enabled
                ? '2FA is currently enabled on your account'
                : '2FA is currently disabled. Enable it to add an extra layer of security.'}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold ${
            enabled
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}>
            {enabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>

        {enabled ? (
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDisable}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
            >
              Disable 2FA
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              Reset 2FA
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSetup(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            Enable 2FA
          </motion.button>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">About 2FA</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
          <li>• Two-factor authentication adds an extra layer of security to your account</li>
          <li>• You&apos;ll need an authenticator app (Google Authenticator, Authy, etc.)</li>
          <li>• After enabling, you&apos;ll need to enter a 6-digit code when logging in</li>
          <li>• Keep your backup codes safe in case you lose access to your authenticator app</li>
        </ul>
      </div>
    </div>
  )
}
