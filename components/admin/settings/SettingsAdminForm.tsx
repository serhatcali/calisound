'use client'

import { useState, useEffect } from 'react'

export function SettingsAdminForm() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    googleAnalyticsId: '',
    googleSearchConsoleId: '',
    contactEmail: '',
    contactEmailSubject: '',
    adminPassword: '',
  })

  useEffect(() => {
    // Load settings from API
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFormData(prev => ({ ...prev, ...data.settings }))
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Settings saved successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save settings')
      }
    } catch (error) {
      alert('Error saving settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          Site Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure Google Analytics, Search Console, Contact Form, and Admin settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Google Analytics */}
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Google Analytics</h2>
          <div>
            <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
              Google Analytics ID (G-XXXXXXXXXX)
            </label>
            <input
              type="text"
              value={formData.googleAnalyticsId}
              onChange={(e) => setFormData(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Your Google Analytics 4 Measurement ID
            </p>
          </div>
        </div>

        {/* Google Search Console */}
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Google Search Console</h2>
          <div>
            <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
              Search Console Verification Code
            </label>
            <input
              type="text"
              value={formData.googleSearchConsoleId}
              onChange={(e) => setFormData(prev => ({ ...prev, googleSearchConsoleId: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Verification code or meta tag content"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Add this to your site's meta tags for Search Console verification
            </p>
          </div>
        </div>

        {/* Contact Form Settings */}
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Contact Form</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                Contact Email Address
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="contact@calisound.com"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Email address where contact form submissions will be sent
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                Contact Email Subject
              </label>
              <input
                type="text"
                value={formData.contactEmailSubject}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmailSubject: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="New Contact Form Submission"
              />
            </div>
          </div>
        </div>

        {/* Admin Settings */}
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Admin Settings</h2>
          <div>
            <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
              Change Admin Password
            </label>
            <input
              type="password"
              value={formData.adminPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Leave empty to keep current password"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Set a new admin password. Leave empty to keep the current password.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
