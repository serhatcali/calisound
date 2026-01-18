'use client'

import { useState, useEffect } from 'react'
import { ClockIcon } from './Icons'
import { useCaliClubStore } from '@/stores/cali-club-store'

export function RecentlyPlayed() {
  const { songs } = useCaliClubStore()
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([])

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('cali_club_recently_played') || '[]')
    setRecentlyPlayed(recent.slice(0, 10)) // Last 10 songs
  }, [])

  const recentSongs = songs.filter((song) => recentlyPlayed.includes(song.id))

  if (recentSongs.length === 0) return null

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <ClockIcon className="text-yellow-500" size={18} />
        <h4 className="text-sm font-bold text-white">Recently Played</h4>
      </div>
      <div className="space-y-2">
        {recentSongs.map((song) => (
          <div
            key={song.id}
            className="p-3 rounded-lg bg-black/60 border-2 border-gray-800 hover:border-gray-700 transition-all"
          >
            <p className="text-white text-sm font-medium truncate">{song.title}</p>
            <p className="text-gray-400 text-xs truncate">{song.artist}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
