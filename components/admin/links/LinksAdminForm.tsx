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

interface BySourceStat {
  source_page: string
  source_label: string
  count: number
}

interface RecentClick {
  id?: string
  link_type: string
  link_url: string
  clicked_at: string | null
  user_agent: string | null
  referrer: string | null
  source_page?: string | null
  source_label?: string | null
  device?: 'mobile' | 'desktop' | 'unknown'
}

export function LinksAdminForm({ links: initialLinks }: LinksAdminFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clickStats, setClickStats] = useState<ClickStat[]>([])
  const [bySourceStats, setBySourceStats] = useState<BySourceStat[]>([])
  const [recentClicks, setRecentClicks] = useState<RecentClick[]>([])
  const [totalClicks, setTotalClicks] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)
  const [sourceFilter, setSourceFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const PAGE_SIZE = 500
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
    setStatsLoading(true)
    const params = new URLSearchParams()
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo)
    params.set('limit', String(PAGE_SIZE))
    params.set('offset', String(offset))
    async function fetchStats() {
      try {
        const res = await fetch(`/api/admin/links/click-stats?${params.toString()}`)
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (offset === 0) {
          setClickStats(data.stats ?? [])
          setBySourceStats(data.by_source ?? [])
        }
        setRecentClicks(data.recent ?? [])
        setTotalClicks(data.total_clicks ?? 0)
        setHasMore(!!data.has_more)
      } catch (_) {}
      finally {
        if (!cancelled) setStatsLoading(false)
      }
    }
    fetchStats()
    return () => { cancelled = true }
  }, [dateFrom, dateTo, offset])

  useEffect(() => {
    setOffset(0)
  }, [dateFrom, dateTo])

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
            Tüm tıklamalar saklanır. Tarih aralığı seçip geriye dönük inceleyebilir, CSV yedek alabilirsin.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 dark:text-gray-400">Başlangıç</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-white text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 dark:text-gray-400">Bitiş</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-white text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => setOffset(0)}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Filtrele / Yenile
            </button>
            <a
              href={`/api/admin/links/click-stats/export${dateFrom || dateTo ? `?${new URLSearchParams({ ...(dateFrom && { from: dateFrom }), ...(dateTo && { to: dateTo }) }).toString()}` : ''}`}
              download
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 inline-flex items-center gap-2"
            >
              CSV indir (yedek)
            </a>
          </div>
          <p className="text-white font-mono text-sm mt-2">
            Toplam: <strong>{totalClicks.toLocaleString('tr-TR')}</strong> tıklama
            {(dateFrom || dateTo) && (
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                (seçili aralık)
              </span>
            )}
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

            {bySourceStats.length > 0 && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-white mb-3">Tıklamalar hangi sayfadan geliyor</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                        <th className="p-3 font-medium">Sayfa / Kaynak</th>
                        <th className="p-3 font-medium">Path</th>
                        <th className="p-3 font-medium">Tıklanma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bySourceStats.map((s) => (
                        <tr key={s.source_page} className="border-b border-gray-100 dark:border-gray-800/50">
                          <td className="p-3 text-white">{s.source_label}</td>
                          <td className="p-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{s.source_page}</td>
                          <td className="p-3 text-white font-mono">{s.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {recentClicks.length > 0 && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                  <h3 className="font-semibold text-white">
                    Son tıklamalar ({offset + 1} – {offset + recentClicks.length} / {totalClicks.toLocaleString('tr-TR')})
                  </h3>
                  <div className="flex items-center gap-2">
                    <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-white text-sm"
                  >
                    <option value="">Tüm kaynaklar</option>
                    {bySourceStats.map((s) => (
                      <option key={s.source_page} value={s.source_page}>{s.source_label} ({s.count})</option>
                    ))}
                  </select>
                    <button
                      type="button"
                      disabled={offset === 0}
                      onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                      className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Önceki
                    </button>
                    <button
                      type="button"
                      disabled={!hasMore}
                      onClick={() => setOffset((o) => o + PAGE_SIZE)}
                      className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
                <ul className="space-y-2 max-h-80 overflow-y-auto">
                  {(sourceFilter
                    ? recentClicks.filter((c) => (c.source_page || '(bilinmiyor)') === sourceFilter)
                    : recentClicks
                  ).map((c, i) => (
                    <li key={c.id || i} className="text-sm flex flex-wrap items-center gap-x-2 gap-y-1 py-1 border-b border-gray-100 dark:border-gray-800/50">
                      <span className="text-gray-400 dark:text-gray-500 font-mono w-6">{i + 1}.</span>
                      <span className="font-medium text-white capitalize">{c.link_type.replace(/_/g, ' ')}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {c.clicked_at ? new Date(c.clicked_at).toLocaleString('tr-TR') : '—'}
                      </span>
                      {c.source_label && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300" title={c.source_page || undefined}>
                          {c.source_label}
                        </span>
                      )}
                      {c.device && c.device !== 'unknown' && (
                        <span className="text-xs text-gray-500">{c.device === 'mobile' ? 'Mobil' : 'Masaüstü'}</span>
                      )}
                      {c.referrer && (
                        <span className="text-xs text-gray-500 truncate max-w-[140px]" title={c.referrer}>referrer</span>
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
