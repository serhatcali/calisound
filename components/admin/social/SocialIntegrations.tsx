'use client'

import { useState, useEffect } from 'react'
import { SocialAccount, SocialPlatform } from '@/types/social-media'
import { format } from 'date-fns'

const PLATFORMS: { value: SocialPlatform; label: string; icon: string; color: string }[] = [
  { value: 'youtube', label: 'YouTube', icon: '▶️', color: 'bg-red-500' },
  { value: 'youtube_shorts', label: 'YouTube Shorts', icon: '📱', color: 'bg-red-600' },
  { value: 'instagram', label: 'Instagram', icon: '📷', color: 'bg-pink-500' },
  { value: 'instagram_story', label: 'Instagram Story', icon: '📸', color: 'bg-pink-600' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵', color: 'bg-black' },
  { value: 'twitter', label: 'X (Twitter)', icon: '🐦', color: 'bg-black' },
  { value: 'facebook', label: 'Facebook', icon: '👥', color: 'bg-blue-600' },
]

export function SocialIntegrations() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/admin/social/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (platform: SocialPlatform) => {
    setConnecting(platform)
    try {
      const response = await fetch('/api/admin/social/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          handle: '', // Will be filled after OAuth
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // TODO: Redirect to OAuth URL when implemented
        alert(`OAuth flow for ${platform} will be implemented. For now, accounts are in "Assisted" mode.`)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to connect'}`)
      }
    } catch (error: any) {
      console.error('Error connecting account:', error)
      alert(`Error: ${error.message || 'Failed to connect'}`)
    } finally {
      setConnecting(null)
      fetchAccounts()
    }
  }

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/social/accounts/${accountId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchAccounts()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to disconnect'}`)
      }
    } catch (error: any) {
      console.error('Error disconnecting account:', error)
      alert(`Error: ${error.message || 'Failed to disconnect'}`)
    }
  }

  const getAccountForPlatform = (platform: SocialPlatform) => {
    return accounts.find(acc => acc.platform === platform)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'disconnected': return 'bg-gray-500'
      case 'expired': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading accounts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          <strong>Note:</strong> Auto-publish mode requires OAuth integration. 
          Currently, all platforms are in <strong>&quot;Assisted&quot;</strong> mode (manual upload with generated content).
        </p>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLATFORMS.map((platform) => {
          const account = getAccountForPlatform(platform.value)
          const isConnected = account?.status === 'connected'
          const isConnecting = connecting === platform.value

          return (
            <div
              key={platform.value}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center text-2xl`}>
                    {platform.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {platform.label}
                    </h3>
                    {account && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{account.handle}
                      </p>
                    )}
                  </div>
                </div>
                {account && (
                  <span
                    className={`px-2 py-1 text-xs font-medium text-white rounded ${getStatusColor(account.status)}`}
                  >
                    {account.status}
                  </span>
                )}
              </div>

              {account && (
                <div className="mb-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {account.expires_at && (
                    <p>
                      Expires: {format(new Date(account.expires_at), 'MMM d, yyyy')}
                    </p>
                  )}
                  {account.scopes && account.scopes.length > 0 && (
                    <p>Scopes: {account.scopes.length}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(account!.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.value)}
                    disabled={isConnecting}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect'}
                  </button>
                )}
                {isConnected && (
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Test
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
