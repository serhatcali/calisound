'use client'

import { useState, useEffect } from 'react'
import { SocialSetting } from '@/types/social-settings'

const TIMEZONES = [
  'Europe/Istanbul',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney',
  'America/Sao_Paulo',
  'Europe/Paris',
  'Asia/Dubai',
  'UTC',
]

export function SocialSettings() {
  const [settings, setSettings] = useState<SocialSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/social/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: any) => {
    setSaving(key)
    try {
      const response = await fetch('/api/admin/social/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update setting')
      }

      const updated = await response.json()
      setSettings(prev => prev.map(s => s.key === key ? updated : s))
      alert('Setting updated successfully!')
    } catch (error: any) {
      console.error('Error updating setting:', error)
      alert(`Error: ${error.message || 'Failed to update setting'}`)
    } finally {
      setSaving(null)
    }
  }

  const getSetting = (key: string): SocialSetting | undefined => {
    return settings.find(s => s.key === key)
  }

  const getSettingValue = (key: string, defaultValue: any = null): any => {
    const setting = getSetting(key)
    if (!setting) return defaultValue
    let value = setting.value
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value)
      } catch {
        return value
      }
    }
    return value
  }

  const groupedSettings = {
    general: settings.filter(s => s.category === 'general'),
    posting: settings.filter(s => s.category === 'posting'),
    approval: settings.filter(s => s.category === 'approval'),
    notifications: settings.filter(s => s.category === 'notifications'),
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          General Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={getSettingValue('timezone', 'Europe/Istanbul')}
              onChange={(e) => updateSetting('timezone', e.target.value)}
              disabled={saving === 'timezone'}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getSetting('timezone')?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Approval Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Approval Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Require Approval
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getSetting('require_approval')?.description}
              </p>
            </div>
            <button
              onClick={() => updateSetting('require_approval', !getSettingValue('require_approval', false))}
              disabled={saving === 'require_approval'}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                getSettingValue('require_approval', false)
                  ? 'bg-orange-600'
                  : 'bg-gray-300 dark:bg-gray-700'
              } disabled:opacity-50`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  getSettingValue('require_approval', false) ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Posting Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Posting Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Auto Publish
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getSetting('auto_publish')?.description}
              </p>
            </div>
            <button
              onClick={() => updateSetting('auto_publish', !getSettingValue('auto_publish', false))}
              disabled={saving === 'auto_publish'}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                getSettingValue('auto_publish', false)
                  ? 'bg-orange-600'
                  : 'bg-gray-300 dark:bg-gray-700'
              } disabled:opacity-50`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  getSettingValue('auto_publish', false) ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Hashtags (comma-separated)
            </label>
            <input
              type="text"
              value={(getSettingValue('default_hashtags', []) as string[]).join(', ')}
              onChange={(e) => {
                const hashtags = e.target.value.split(',').map(h => h.trim()).filter(Boolean)
                updateSetting('default_hashtags', hashtags)
              }}
              disabled={saving === 'default_hashtags'}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
              placeholder="e.g., #music, #calisound, #electronic"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getSetting('default_hashtags')?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Tags (for YouTube, comma-separated)
            </label>
            <input
              type="text"
              value={getSettingValue('default_tags', '')}
              onChange={(e) => updateSetting('default_tags', e.target.value)}
              disabled={saving === 'default_tags'}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
              placeholder="e.g., music, electronic, calisound"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getSetting('default_tags')?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Daily Posts per Platform
            </label>
            <input
              type="number"
              value={getSettingValue('max_daily_posts', 10)}
              onChange={(e) => updateSetting('max_daily_posts', parseInt(e.target.value) || 10)}
              disabled={saving === 'max_daily_posts'}
              min="1"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getSetting('max_daily_posts')?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Notification Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enable Notifications
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getSetting('enable_notifications')?.description}
              </p>
            </div>
            <button
              onClick={() => updateSetting('enable_notifications', !getSettingValue('enable_notifications', true))}
              disabled={saving === 'enable_notifications'}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                getSettingValue('enable_notifications', true)
                  ? 'bg-orange-600'
                  : 'bg-gray-300 dark:bg-gray-700'
              } disabled:opacity-50`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  getSettingValue('enable_notifications', true) ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Email
            </label>
            <input
              type="email"
              value={getSettingValue('notification_email', '')}
              onChange={(e) => updateSetting('notification_email', e.target.value)}
              disabled={saving === 'notification_email'}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
              placeholder="admin@example.com"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getSetting('notification_email')?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
