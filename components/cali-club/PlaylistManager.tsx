'use client'

import { useState, useEffect } from 'react'
import { MusicIcon, PlusIcon, XIcon } from './Icons'
import { showToast } from './Toast'
import { motion, AnimatePresence } from 'framer-motion'

interface Playlist {
  id: string
  name: string
  songs: string[]
}

export function PlaylistManager() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cali_club_playlists') || '[]')
    setPlaylists(saved)
  }, [])

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) {
      showToast('Please enter a playlist name', 'warning')
      return
    }

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      songs: [],
    }

    const updated = [...playlists, newPlaylist]
    setPlaylists(updated)
    localStorage.setItem('cali_club_playlists', JSON.stringify(updated))
    setNewPlaylistName('')
    setShowCreate(false)
    showToast('Playlist created!', 'success')
  }

  const deletePlaylist = (id: string) => {
    const updated = playlists.filter((p) => p.id !== id)
    setPlaylists(updated)
    localStorage.setItem('cali_club_playlists', JSON.stringify(updated))
    showToast('Playlist deleted', 'info')
  }

  if (playlists.length === 0 && !showCreate) {
    return (
      <div className="mb-4">
        <button
          onClick={() => setShowCreate(true)}
          className="w-full p-3 rounded-lg bg-black/60 border-2 border-gray-800 hover:border-yellow-500 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-yellow-500"
        >
          <PlusIcon size={18} />
          <span className="text-sm font-medium">Create Playlist</span>
        </button>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MusicIcon className="text-yellow-500" size={18} />
          <h4 className="text-sm font-bold text-white">Playlists</h4>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="p-1.5 text-gray-400 hover:text-yellow-500 transition-colors"
            aria-label="Create playlist"
          >
            <PlusIcon size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-3 rounded-lg bg-black/60 border-2 border-gray-800"
          >
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createPlaylist()}
              placeholder="Playlist name..."
              className="w-full px-3 py-2 bg-black/80 rounded-lg border-2 border-gray-800 text-white text-sm focus:border-yellow-500 focus:outline-none mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={createPlaylist}
                className="flex-1 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-amber-600 transition-all"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreate(false)
                  setNewPlaylistName('')
                }}
                className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="p-3 rounded-lg bg-black/60 border-2 border-gray-800 hover:border-gray-700 transition-all flex items-center justify-between group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{playlist.name}</p>
              <p className="text-gray-500 text-xs">{playlist.songs.length} songs</p>
            </div>
            <button
              onClick={() => deletePlaylist(playlist.id)}
              className="p-1.5 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Delete playlist"
            >
              <XIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
