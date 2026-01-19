'use client'

import { useState } from 'react'

export default function TestSentryPage() {
  const [tested, setTested] = useState(false)
  const [message, setMessage] = useState('')

  const testError = () => {
    try {
      setTested(true)
      // Create a test error
      const error = new Error('Test Error - Sentry Test için oluşturuldu')
      
      // Send to Sentry if available (dynamic import)
      if (typeof window !== 'undefined') {
        import('@sentry/nextjs')
          .then((Sentry) => {
            Sentry.captureException(error)
            setMessage('✅ Test hatası Sentry\'ye gönderildi! Sentry dashboard\'u kontrol edin.')
          })
          .catch((err) => {
            console.error('Sentry not available:', err)
            setMessage('⚠️ Sentry yüklenemedi. Console\'u kontrol edin veya npm install çalıştırın.')
          })
      }
    } catch (error) {
      console.error('Test error:', error)
      setMessage('❌ Hata oluştu! Console\'u kontrol edin.')
    }
  }

  const testManualError = () => {
    try {
      setTested(true)
      // Send to Sentry if available
      if (typeof window !== 'undefined') {
        import('@sentry/nextjs')
          .then((Sentry) => {
            Sentry.captureMessage('Manuel test mesajı - Sentry test için', 'info')
            setMessage('✅ Test mesajı Sentry\'ye gönderildi!')
          })
          .catch((err) => {
            console.error('Sentry not available:', err)
            setMessage('⚠️ Sentry yüklenemedi. Console\'u kontrol edin veya npm install çalıştırın.')
          })
      }
    } catch (error) {
      console.error('Test error:', error)
      setMessage('❌ Hata oluştu! Console\'u kontrol edin.')
    }
  }

  const testConsoleError = () => {
    setTested(true)
    // Simple console error that should be caught by Sentry
    console.error('Test console error - Sentry should catch this')
    setMessage('✅ Console error oluşturuldu. Sentry dashboard\'u kontrol edin.')
  }

  const testSentryLogger = async () => {
    try {
      setTested(true)
      // Use Sentry captureMessage API instead of logger (logger is not exported)
      if (typeof window !== 'undefined') {
        const Sentry = await import('@sentry/nextjs')
        Sentry.captureMessage('User triggered test log', 'info')
        Sentry.captureMessage('User triggered test warning', 'warning')
        Sentry.captureMessage('User triggered test error log', 'error')
        setMessage('✅ Sentry mesajları gönderildi! (info, warn, error) Sentry dashboard\'u kontrol edin.')
      }
    } catch (error) {
      console.error('Sentry test error:', error)
      setMessage('❌ Sentry yüklenemedi. Console\'u kontrol edin.')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">
          Sentry Test Sayfası
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Bu sayfa Sentry entegrasyonunu test etmek için oluşturuldu.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={testError}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Test Error Oluştur
          </button>
          
          <button
            onClick={testManualError}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Test Mesajı Gönder
          </button>

          <button
            onClick={testConsoleError}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Console Error Oluştur
          </button>

          <button
            onClick={testSentryLogger}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Sentry Logger Test (info/warn/error)
          </button>
        </div>

        {tested && message && (
          <p className="mt-6 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            {message}
            <br />
            <a
              href="https://sentry.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:underline mt-2 inline-block"
            >
              Sentry Dashboard →
            </a>
          </p>
        )}

        <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
          <p>Not: Sentry paketi yüklü değilse önce şunu çalıştırın:</p>
          <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded mt-2 inline-block">
            npm install
          </code>
        </div>
      </div>
    </div>
  )
}
