'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import QRCode from 'qrcode'

interface TwoFactorSetupProps {
  onComplete: () => void
}

export function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const [secret, setSecret] = useState<string | null>(null)
  const [otpAuthUrl, setOtpAuthUrl] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'setup' | 'verify'>('setup')

  useEffect(() => {
    if (step === 'setup') {
      generateSecret()
    }
  }, [step])

  const generateSecret = async () => {
    try {
      const response = await fetch('/api/admin/2fa/setup')
      const data = await response.json()

      if (data.success) {
        setSecret(data.secret)
        setOtpAuthUrl(data.otpAuthUrl)

        // Generate QR code
        const qr = await QRCode.toDataURL(data.otpAuthUrl)
        setQrCode(qr)
      }
    } catch (error) {
      console.error('Error generating secret:', error)
      setError('Failed to generate 2FA secret')
    }
  }

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, token: verificationCode }),
      })

      const data = await response.json()

      if (data.success) {
        onComplete()
      } else {
        setError(data.error || 'Failed to enable 2FA')
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error)
      setError('Failed to enable 2FA')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'setup' && qrCode) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Setup Two-Factor Authentication
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          {qrCode && (
            <div className="bg-white p-4 rounded-xl">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 w-full">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Manual Entry Code:</p>
            <code className="text-sm font-mono text-gray-900 dark:text-white break-all">
              {secret}
            </code>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            After scanning, enter the 6-digit code from your app to verify and enable 2FA.
          </p>
        </div>

        <button
          onClick={() => setStep('verify')}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
        >
          I&apos;ve Scanned the QR Code
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleEnable} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-300 mb-2">
          Enter Verification Code
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
          onClick={() => setStep('setup')}
          className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading || verificationCode.length !== 6}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enabling...' : 'Enable 2FA'}
        </button>
      </div>
    </form>
  )
}
