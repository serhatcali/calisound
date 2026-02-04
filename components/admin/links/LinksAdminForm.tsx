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
      <div className="bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-gray-800 bg-gradient-to-b from-gray-900/80 to-transparent">
          <h2 className="text-2xl font-bold text-white">
            Link tıklama istatistikleri
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Tüm tıklamalar saklanır. Tarih aralığı seçip geriye dönük inceleyebilir, CSV yedek alabilirsin.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Başlangıç</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Bitiş</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setOffset(0)}
              className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-500"
            >
              Filtrele / Yenile
            </button>
            <a
              href={`/api/admin/links/click-stats/export${dateFrom || dateTo ? `?${new URLSearchParams({ ...(dateFrom && { from: dateFrom }), ...(dateTo && { to: dateTo }) }).toString()}` : ''}`}
              download
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 inline-flex items-center gap-2"
            >
              CSV indir (yedek)
            </a>
          </div>
          <p className="text-gray-300 text-sm mt-3">
            Toplam <strong className="text-white">{totalClicks.toLocaleString('tr-TR')}</strong> tıklama
            {(dateFrom || dateTo) && <span className="text-gray-500 ml-1">(seçili aralık)</span>}
          </p>
        </div>
        {statsLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div>
        ) : (
          <>
            {clickStats.length === 0 && bySourceStats.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">Henüz tıklama kaydı yok.</div>
            ) : (
              <>
                {/* Özet kartlar */}
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 p-4">
                    <p className="text-xs font-medium text-orange-300 uppercase tracking-wider">Toplam tıklama</p>
                    <p className="text-2xl font-black text-white mt-1">{totalClicks.toLocaleString('tr-TR')}</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 p-4">
                    <p className="text-xs font-medium text-emerald-300 uppercase tracking-wider">Link sayısı</p>
                    <p className="text-2xl font-black text-white mt-1">{clickStats.length}</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30 p-4">
                    <p className="text-xs font-medium text-violet-300 uppercase tracking-wider">Kaynak sayısı</p>
                    <p className="text-2xl font-black text-white mt-1">{bySourceStats.length}</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 p-4">
                    <p className="text-xs font-medium text-cyan-300 uppercase tracking-wider">En çok tıklanan</p>
                    <p className="text-lg font-bold text-white mt-1 truncate" title={clickStats[0]?.link_type}>
                      {clickStats[0] ? `${clickStats[0].link_type.replace(/_/g, ' ')} (${clickStats[0].count})` : '—'}
                    </p>
                  </div>
                </div>

                {/* Grafik: Link bazında tıklamalar (bar chart) */}
                {clickStats.length > 0 && (
                  <div className="px-6 pb-6">
                    <h3 className="font-semibold text-white mb-4">Link bazında tıklamalar (grafik)</h3>
                    <div className="rounded-xl bg-gray-900/50 border border-gray-700/50 p-4 space-y-4">
                      {(() => {
                        const maxCount = Math.max(...clickStats.map((s) => s.count), 1)
                        const colors = ['from-orange-500 to-amber-500', 'from-emerald-500 to-green-500', 'from-violet-500 to-purple-500', 'from-cyan-500 to-blue-500', 'from-rose-500 to-pink-500', 'from-amber-500 to-yellow-500', 'from-indigo-500 to-blue-500', 'from-teal-500 to-emerald-500']
                        return clickStats.map((s, i) => (
                          <div key={s.link_type} className="group">
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span className="text-sm font-medium text-white capitalize shrink-0 w-28">{s.link_type.replace(/_/g, ' ')}</span>
                              <span className="text-sm font-mono text-gray-400 tabular-nums">{s.count.toLocaleString('tr-TR')}</span>
                            </div>
                            <div className="h-8 rounded-lg bg-gray-800 overflow-hidden">
                              <div
                                className={`h-full rounded-lg bg-gradient-to-r ${colors[i % colors.length]} transition-all duration-500 min-w-[2rem] flex items-center justify-end pr-2`}
                                style={{ width: `${Math.max((s.count / maxCount) * 100, 2)}%` }}
                              >
                                {s.count / maxCount > 0.25 && <span className="text-xs font-bold text-white/90">{s.count}</span>}
                              </div>
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                )}

                {/* Tablo: Link detay */}
                {clickStats.length > 0 && (
                  <div className="px-6 pb-6">
                    <h3 className="font-semibold text-white mb-3">Link detay tablosu</h3>
                    <div className="rounded-xl border border-gray-700/50 overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-800/80 border-b border-gray-700">
                            <th className="p-4 font-semibold text-gray-200">Link</th>
                            <th className="p-4 font-semibold text-gray-200 w-24 text-right">Tıklanma</th>
                            <th className="p-4 font-semibold text-gray-200 hidden sm:table-cell">Son tıklama</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clickStats.map((s) => (
                            <tr key={s.link_type} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                              <td className="p-4">
                                <span className="font-medium text-white capitalize">{s.link_type.replace(/_/g, ' ')}</span>
                                <br />
                                <span className="text-xs text-gray-500 truncate max-w-[220px] inline-block" title={s.link_url}>{s.link_url}</span>
                              </td>
                              <td className="p-4 text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-orange-500/20 text-orange-300">{s.count.toLocaleString('tr-TR')}</span>
                              </td>
                              <td className="p-4 text-gray-400 text-sm hidden sm:table-cell">
                                {s.last_clicked_at ? new Date(s.last_clicked_at).toLocaleString('tr-TR') : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Grafik: Kaynak bazında + tablo */}
                {bySourceStats.length > 0 && (
                  <div className="px-6 pb-6 border-t border-gray-800">
                    <h3 className="font-semibold text-white mb-4 mt-4">Tıklamalar hangi sayfadan geliyor</h3>
                    <div className="rounded-xl bg-gray-900/50 border border-gray-700/50 p-4 mb-4">
                      {(() => {
                        const maxSrc = Math.max(...bySourceStats.map((s) => s.count), 1)
                        const srcColors = ['from-sky-500 to-blue-500', 'from-fuchsia-500 to-pink-500', 'from-lime-500 to-green-500', 'from-amber-500 to-orange-500']
                        return bySourceStats.slice(0, 10).map((s, i) => (
                          <div key={s.source_page} className="flex items-center gap-3 py-2">
                            <span className="text-sm text-gray-300 shrink-0 w-40 truncate" title={s.source_label}>{s.source_label}</span>
                            <div className="flex-1 h-6 rounded-md bg-gray-800 overflow-hidden">
                              <div
                                className={`h-full rounded-md bg-gradient-to-r ${srcColors[i % srcColors.length]} transition-all duration-500 min-w-[1.5rem]`}
                                style={{ width: `${Math.max((s.count / maxSrc) * 100, 3)}%` }}
                              />
                            </div>
                            <span className="text-sm font-mono text-gray-400 w-12 text-right">{s.count}</span>
                          </div>
                        ))
                      })()}
                    </div>
                    <div className="rounded-xl border border-gray-700/50 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-gray-800/80 border-b border-gray-700 text-gray-400">
                            <th className="p-3 font-medium">Sayfa / Kaynak</th>
                            <th className="p-3 font-medium hidden md:table-cell">Path</th>
                            <th className="p-3 font-medium w-20 text-right">Tıklanma</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bySourceStats.map((s) => (
                            <tr key={s.source_page} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                              <td className="p-3 text-white">{s.source_label}</td>
                              <td className="p-3 text-gray-500 font-mono text-xs hidden md:table-cell">{s.source_page}</td>
                              <td className="p-3 text-right"><span className="font-mono text-emerald-400">{s.count}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {recentClicks.length > 0 && (
              <div className="p-6 border-t border-gray-800">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <h3 className="font-semibold text-white">
                    Son tıklamalar <span className="text-gray-400 font-normal">({offset + 1} – {offset + recentClicks.length} / {totalClicks.toLocaleString('tr-TR')})</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:ring-2 focus:ring-orange-500"
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
                      className="px-3 py-2 rounded-lg bg-gray-700 text-gray-200 text-sm disabled:opacity-50 hover:bg-gray-600"
                    >
                      Önceki
                    </button>
                    <button
                      type="button"
                      disabled={!hasMore}
                      onClick={() => setOffset((o) => o + PAGE_SIZE)}
                      className="px-3 py-2 rounded-lg bg-gray-700 text-gray-200 text-sm disabled:opacity-50 hover:bg-gray-600"
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-700/50 overflow-hidden">
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-800/95 z-10">
                        <tr className="border-b border-gray-700 text-gray-400">
                          <th className="p-3 text-left w-10">#</th>
                          <th className="p-3 text-left">Link</th>
                          <th className="p-3 text-left">Tarih</th>
                          <th className="p-3 text-left hidden sm:table-cell">Kaynak</th>
                          <th className="p-3 text-left w-20 hidden md:table-cell">Cihaz</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(sourceFilter ? recentClicks.filter((c) => (c.source_page || '(bilinmiyor)') === sourceFilter) : recentClicks).map((c, i) => (
                          <tr key={c.id || i} className="border-b border-gray-800/50 hover:bg-gray-800/40">
                            <td className="p-3 font-mono text-gray-500">{offset + i + 1}</td>
                            <td className="p-3 font-medium text-white capitalize">{c.link_type.replace(/_/g, ' ')}</td>
                            <td className="p-3 text-gray-400">{c.clicked_at ? new Date(c.clicked_at).toLocaleString('tr-TR') : '—'}</td>
                            <td className="p-3 hidden sm:table-cell">
                              {c.source_label ? <span className="px-2 py-0.5 rounded bg-gray-700 text-gray-300 text-xs">{c.source_label}</span> : '—'}
                            </td>
                            <td className="p-3 hidden md:table-cell text-gray-500 text-xs">{c.device === 'mobile' ? 'Mobil' : c.device === 'desktop' ? 'Masaüstü' : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
