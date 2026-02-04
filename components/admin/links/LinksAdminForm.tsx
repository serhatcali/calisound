'use client'

import { GlobalLinks } from '@/types/database'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface LinksAdminFormProps {
  links: GlobalLinks | null
}

interface ClickStat {
  link_type: string
  link_url: string
  count: number
  last_clicked_at: string | null
}

interface RecentClick {
  id?: string
  link_type: string
  link_url: string
  clicked_at: string | null
  user_agent: string | null
  referrer: string | null
}

export function LinksAdminForm({ links: initialLinks }: LinksAdminFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clickStats, setClickStats] = useState<ClickStat[]>([])
  const [recentClicks, setRecentClicks] = useState<RecentClick[]>([])
  const [totalClicks, setTotalClicks] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)
  const [formData, setFormData] = useState({
    youtube: initialLinks?.youtube || '',
    instagram: initialLinks?.instagram || '',
    tiktok: initialLinks?.tiktok || '',
    spotify: initialLinks?.spotify || '',
    apple_music: initialLinks?.apple_music || '',
    soundcloud: initialLinks?.soundcloud || '',
    x: initialLinks?.x || '',
    facebook: initialLinks?.facebook || '',
  })

  useEffect(() => {
    let cancelled = false
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/links/click-stats')
        if (!res.ok || cancelled) return
        const data = await res.json()
        setClickStats(data.stats ?? [])
        setRecentClicks(data.recent ?? [])
        setTotalClicks(data.total_clicks ?? 0)
      } catch (_) {}
      finally {
        if (!cancelled) setStatsLoading(false)
      }
    }
    fetchStats()
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Global links updated successfully!')
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update links')
      }
    } catch (error) {
      alert('Error updating links')
    } finally {
      setLoading(false)
    }
  }

  const linkFields = [
    { key: 'youtube', label: 'YouTube', icon: '📺' },
    { key: 'instagram', label: 'Instagram', icon: '📷' },
    { key: 'tiktok', label: 'TikTok', icon: '🎵' },
    { key: 'spotify', label: 'Spotify', icon: '🎧' },
    { key: 'apple_music', label: 'Apple Music', icon: '🍎' },
    { key: 'soundcloud', label: 'SoundCloud', icon: '☁️' },
    { key: 'x', label: 'X (Twitter)', icon: '🐦' },
    { key: 'facebook', label: 'Facebook', icon: '👥' },
  ] as const

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          Global Links Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update global links that appear throughout the site (Homepage, Footer, etc.)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {linkFields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-white dark:text-gray-300 mb-2">
                  <span className="mr-2">{field.icon}</span>
                  {field.label}
                </label>
                <input
                  type="url"
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={`https://...`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> These links will be automatically updated across the entire site, including:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1">
            <li>Homepage &quot;Listen Everywhere&quot; section</li>
            <li>Footer social links</li>
            <li>All city pages (if not overridden)</li>
            <li>Navigation and other global components</li>
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Update Global Links'}
          </button>
        </div>
      </form>

      {/* Link tıklama istatistikleri */}
      <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-white">
            Link tıklama istatistikleri
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Sayfadaki linklere kim, kaç kez tıkladı (toplam: {totalClicks} tıklama)
          </p>
        </div>
        {statsLoading ? (
          <div className="p-6 text-gray-500 dark:text-gray-400">Yükleniyor...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <th className="p-4 font-semibold text-white">Link</th>
                    <th className="p-4 font-semibold text-white">Tıklanma</th>
                    <th className="p-4 font-semibold text-white">Son tıklama</th>
                  </tr>
                </thead>
                <tbody>
                  {clickStats.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-6 text-gray-500 dark:text-gray-400">
                        Henüz tıklama kaydı yok.
                      </td>
                    </tr>
                  ) : (
                    clickStats.map((s) => (
                      <tr key={s.link_type} className="border-b border-gray-100 dark:border-gray-800/50">
                        <td className="p-4">
                          <span className="font-medium text-white capitalize">{s.link_type.replace(/_/g, ' ')}</span>
                          <br />
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] inline-block" title={s.link_url}>{s.link_url}</span>
                        </td>
                        <td className="p-4 text-white font-mono">{s.count}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300 text-sm">
                          {s.last_clicked_at
                            ? new Date(s.last_clicked_at).toLocaleString('tr-TR')
                            : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {recentClicks.length > 0 && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-white mb-3">Son tıklamalar (en son 50)</h3>
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {recentClicks.map((c, i) => (
                    <li key={c.id || i} className="text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-gray-400 dark:text-gray-500 font-mono w-8">{i + 1}.</span>
                      <span className="font-medium text-white capitalize">{c.link_type.replace(/_/g, ' ')}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {c.clicked_at ? new Date(c.clicked_at).toLocaleString('tr-TR') : '—'}
                      </span>
                      {c.referrer && (
                        <span className="text-xs text-gray-500 truncate max-w-[120px]" title={c.referrer}>referrer</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
