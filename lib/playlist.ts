'use client'

const PLAYLIST_KEY = 'cali-sound-playlist'

export interface PlaylistItem {
  id: string
  type: 'city' | 'set'
  name: string
  url: string
  image?: string
  addedAt: string
}

export function getPlaylist(): PlaylistItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(PLAYLIST_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addToPlaylist(item: PlaylistItem): void {
  if (typeof window === 'undefined') return
  
  const playlist = getPlaylist()
  
  // Check if already exists
  if (playlist.some(i => i.id === item.id && i.type === item.type)) {
    return
  }
  
  playlist.push(item)
  localStorage.setItem(PLAYLIST_KEY, JSON.stringify(playlist))
  
  // Dispatch event for other components
  window.dispatchEvent(new CustomEvent('playlist-changed'))
}

export function removeFromPlaylist(id: string, type: 'city' | 'set'): void {
  if (typeof window === 'undefined') return
  
  const playlist = getPlaylist()
  const filtered = playlist.filter(i => !(i.id === id && i.type === type))
  localStorage.setItem(PLAYLIST_KEY, JSON.stringify(filtered))
  
  window.dispatchEvent(new CustomEvent('playlist-changed'))
}

export function clearPlaylist(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(PLAYLIST_KEY)
  window.dispatchEvent(new CustomEvent('playlist-changed'))
}

export function isInPlaylist(id: string, type: 'city' | 'set'): boolean {
  const playlist = getPlaylist()
  return playlist.some(i => i.id === id && i.type === type)
}
