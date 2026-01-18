'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCaliClubStore } from '@/stores/cali-club-store'
import { MusicIcon, RefreshIcon, YouTubeIcon } from './Icons'
import { showToast } from './Toast'
import { Tooltip } from './Tooltip'
import { SearchBar } from './SearchBar'
import { SongListSkeleton } from './SkeletonLoader'
import { useMemo, memo } from 'react'
import { FavoritesManager } from './FavoritesManager'
import { RecentlyPlayed } from './RecentlyPlayed'
import { PlaylistManager } from './PlaylistManager'

export function SongList() {
  const { songs, currentSong, isPlaying, setSongs, setCurrentSong, setIsPlaying } = useCaliClubStore()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadCaliSoundSongs()
  }, [])

  // Filter songs based on search query
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs
    
    const query = searchQuery.toLowerCase()
    return songs.filter((song) => 
      song.title?.toLowerCase().includes(query) ||
      song.artist?.toLowerCase().includes(query)
    )
  }, [songs, searchQuery])

  const loadCaliSoundSongs = async () => {
    try {
      setLoading(true)
      
      // First, clean up existing Topic channel songs from database
      try {
        const cleanupResponse = await fetch('/api/cali-club/songs?action=cleanup-topic', { method: 'PUT' })
        const cleanupData = await cleanupResponse.json()
        console.log('[Cleanup]', cleanupData)
      } catch (cleanupError) {
        console.warn('Cleanup warning:', cleanupError)
      }
      
      console.log('[Load] Fetching songs from YouTube API...')
      const response = await fetch('/api/youtube-music/cali-sound-songs')
      
      console.log('[Load] Response status:', response.status, response.statusText)
      
      const responseData = await response.json()
      console.log('[Load] Response data:', responseData)
      
      if (response.ok) {
        const data = responseData
        console.log('[Load] Received songs from API:', data.count || data.songs?.length || 0, 'songs')
        const caliSoundSongs = data.songs || []
        
        if (caliSoundSongs.length === 0) {
          console.warn('[Load] No songs received from API')
          const errorMsg = data.error || data.message || 'No songs found in playlist'
          console.error('[Load] Error details:', data)
          alert(`${errorMsg}\n\nDetaylar: ${JSON.stringify(data, null, 2)}`)
          return
        }
        
        // Log detailed metadata for analysis
        console.log('[Load] ========== SONG METADATA ANALYSIS ==========')
        caliSoundSongs.forEach((song: any, index: number) => {
          const duration = song._metadata?.durationSeconds || song.duration || 0
          const durationMin = Math.floor(duration / 60)
          const durationSec = duration % 60
          const durationStr = `${durationMin}:${durationSec.toString().padStart(2, '0')}`
          
          console.log(`[Song ${index + 1}]`, {
            title: song.title,
            artist: song.artist,
            categoryId: song._metadata?.categoryId,
            duration: `${duration}s (${durationStr})`,
            channel: song._metadata?.channelTitle,
            videoOwnerChannel: song._metadata?.videoOwnerChannelTitle,
            tags: song._metadata?.tags || [],
            hasShortsTag: song._metadata?.hasShortsTag,
            isTopicChannel: song._metadata?.isTopicChannel,
            description: song._metadata?.description?.substring(0, 200) + '...',
            isShort: duration < 90 ? 'YES (SHORT)' : duration > 480 ? 'YES (LONG)' : 'NO',
            isMusic: song._metadata?.categoryId === '10' ? 'YES' : 'NO',
          })
        })
        console.log('[Load] ===========================================')
        
        // Format songs for store
        const formattedSongs = caliSoundSongs.map((song: any) => {
          // Get duration from metadata or song object (in seconds)
          const durationSeconds = song._metadata?.durationSeconds || song.duration || 0
          return {
            id: song.id,
            title: song.title,
            artist: song.artist,
            album: null,
            apple_music_id: song.id, // Store YouTube video ID here
            apple_music_url: song.youtube_url,
            preview_url: song.embed_url,
            artwork_url: song.thumbnail,
            duration: durationSeconds > 0 ? durationSeconds : null, // Store duration in seconds
            genre: null,
          }
        })
        
        console.log('[Load] Formatted songs:', formattedSongs.length)
        
        // Save to Supabase (sync only, don't use database songs)
        await syncSongsToDatabase(formattedSongs)
        
        // Use only filtered songs from API, not from database
        console.log('[Load] Setting songs from API (filtered):', formattedSongs.length)
        setSongs(formattedSongs)
      } else {
        const error = responseData
        console.error('[Load] Error loading CALI Sound songs:', error)
        const errorMsg = error.error || error.message || 'Bilinmeyen hata'
        const details = error.details ? `\n\nDetaylar: ${JSON.stringify(error.details, null, 2)}` : ''
        showToast(`Error loading songs: ${errorMsg}`, 'error')
      }
    } catch (error: any) {
      console.error('[Load] Error loading songs:', error)
      showToast(`Error loading songs: ${error.message || 'Unknown error'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const syncSongsToDatabase = async (youtubeSongs: any[]) => {
    try {
      // Get existing songs from database
      const existingResponse = await fetch('/api/cali-club/songs')
      const existingData = await existingResponse.ok ? await existingResponse.json() : { songs: [] }
      const existingSongs = existingData.songs || []
      const existingVideoIds = new Set(existingSongs.map((s: any) => s.apple_music_id))

      // Add new songs to database
      const newSongs = youtubeSongs.filter((song) => !existingVideoIds.has(song.id))
      
      for (const song of newSongs) {
        try {
          const songData = {
            title: song.title,
            artist: song.artist,
            album: null,
            apple_music_id: song.id,
            apple_music_url: song.youtube_url,
            preview_url: song.embed_url,
            artwork_url: song.thumbnail,
            duration: null,
            genre: null,
          }

          const addResponse = await fetch('/api/cali-club/songs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(songData),
          })
          
          if (!addResponse.ok) {
            const errorData = await addResponse.json()
            // Silently skip if it's a rejected Topic channel or duplicate
            if (errorData.rejected || errorData.error?.includes('duplicate') || errorData.error?.includes('unique')) {
              console.log(`[Sync] Skipping song: ${song.title} - ${errorData.error || 'duplicate/rejected'}`)
            } else {
              console.error(`[Sync] Error adding song ${song.title}:`, errorData)
            }
          }
        } catch (error: any) {
          console.error(`[Sync] Error adding song ${song.title}:`, error.message || error)
        }
      }

      // Don't return database songs - caller will use API songs directly
      // This ensures only filtered songs from API are shown
      return []
    } catch (error) {
      console.error('Error syncing songs:', error)
      return []
    }
  }

  const handlePlay = async (song: any) => {
    console.log('[SongList] handlePlay called for song:', song.title, 'videoId:', song.id)
    
    // Save to recently played
    const recent = JSON.parse(localStorage.getItem('cali_club_recently_played') || '[]')
    const updatedRecent = [song.id, ...recent.filter((id: string) => id !== song.id)].slice(0, 50)
    localStorage.setItem('cali_club_recently_played', JSON.stringify(updatedRecent))
    
    const videoId = getVideoId(song)
    console.log('[SongList] Extracted videoId:', videoId)
    
    if (!videoId) {
      console.error('[SongList] No valid video ID found for song:', song)
      showToast('Invalid video ID', 'error')
      return
    }
    
    if (currentSong?.id === song.id) {
      // Toggle play/pause
      const newPlayingState = !isPlaying
      console.log('[SongList] Toggling play/pause. New state:', newPlayingState)
      setIsPlaying(newPlayingState)
      
      // Update state in database for real-time sync
      try {
        await fetch('/api/cali-club/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            is_playing: newPlayingState,
          }),
        })
      } catch (error) {
        console.error('[SongList] Error updating state:', error)
      }
    } else {
      // Play new song
      console.log('[SongList] Playing new song:', song.title)
      setCurrentSong(song)
      setIsPlaying(true)
      
      // Update state in database for real-time sync
      try {
        // Find song ID in database by apple_music_id (which stores YouTube video ID)
        const songsResponse = await fetch('/api/cali-club/songs')
        const songsData = await songsResponse.json()
        const dbSong = songsData.songs?.find((s: any) => s.apple_music_id === song.id)
        const dbSongId = dbSong?.id || null
        
        if (dbSongId) {
          await fetch('/api/cali-club/state', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              current_song_id: dbSongId,
              is_playing: true,
              position: 0,
            }),
          })
        }
      } catch (error) {
        console.error('[SongList] Error updating state:', error)
      }
    }
  }

  // Extract video ID from song
  const getVideoId = (song: any) => {
    if (!song) return null
    // First try song.id (from API response)
    if (song.id && song.id.length === 11) return song.id
    // Then try apple_music_id (from database)
    if (song.apple_music_id && song.apple_music_id.length === 11) return song.apple_music_id
    // Then try extracting from URL
    const url = song.preview_url || song.apple_music_url || song.youtube_url || ''
    const match = url.match(/(?:embed\/|watch\?v=|\/)([a-zA-Z0-9_-]{11})/)
    if (match) return match[1]
    return null
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading CALI Sound songs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-5 border-b-2 border-gray-900/50 bg-gradient-to-br from-yellow-500/10 via-amber-500/8 to-yellow-600/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/3 rounded-full blur-3xl" />
        <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center backdrop-blur-sm">
            <MusicIcon className="text-yellow-400" size={16} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-0.5">CALI Sound Songs</h3>
            <p className="text-xs text-gray-500 font-medium">
              YouTube Channel
            </p>
          </div>
        </div>
        {songs.length > 0 && (
          <div className="mb-3">
            <SearchBar
              placeholder="Search songs..."
              onSearch={setSearchQuery}
            />
          </div>
        )}
        <Tooltip content="Refresh the song list from YouTube">
          <button
            onClick={loadCaliSoundSongs}
            disabled={loading}
            className="w-full px-4 py-2.5 bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 ring-1 ring-yellow-400/20 border border-yellow-400/10"
          >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshIcon size={16} />
              Refresh
            </>
          )}
          </button>
        </Tooltip>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 smooth-scroll">
        {/* Playlists */}
        {!loading && songs.length > 0 && <PlaylistManager />}
        
        {/* Recently Played */}
        {!loading && songs.length > 0 && <RecentlyPlayed />}
        
        {/* Song List */}
        {loading ? (
          <SongListSkeleton count={5} />
        ) : songs.length === 0 ? (
          <div className="text-center text-gray-400 p-8">
            <MusicIcon className="text-gray-600 mx-auto mb-4" size={48} />
            <p className="font-medium mb-2">No songs found yet</p>
            <p className="text-xs text-gray-500">Click the refresh button above to load songs from YouTube</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center text-gray-400 p-8">
            <MusicIcon className="text-gray-600 mx-auto mb-4" size={48} />
            <p className="font-medium mb-2">No songs match your search</p>
            <p className="text-xs text-gray-500">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredSongs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => handlePlay(song)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handlePlay(song)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Play ${song.title} by ${song.artist}`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-xl cursor-pointer transition-all backdrop-blur-xl focus-visible-ring ${
                    currentSong?.id === song.id
                      ? 'bg-gradient-to-br from-yellow-500/20 via-amber-500/12 to-yellow-600/12 border-2 border-yellow-500/30 shadow-lg shadow-yellow-500/20 ring-1 ring-yellow-400/15'
                      : 'bg-gradient-to-br from-gray-950/90 to-black/90 hover:from-gray-900/90 hover:to-gray-950/90 border-2 border-gray-900/50 hover:border-gray-800 hover:shadow-lg'
                  }`}
                >
                <div className="flex items-center gap-3">
                  {song.artwork_url && (
                    <div className="relative">
                      <img
                        src={song.artwork_url}
                        alt={song.title}
                        className="w-12 h-12 rounded-xl object-cover shadow-lg ring-1 ring-gray-800/30 border border-black/30"
                        loading="lazy"
                      />
                      {currentSong?.id === song.id && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center shadow-md ring-1 ring-yellow-400/50">
                          {isPlaying ? (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          ) : (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate mb-1 leading-tight">{song.title}</p>
                    <p className="text-gray-400 text-xs font-medium truncate mb-1.5">{song.artist}</p>
                    <div className="flex items-center gap-1.5">
                      <YouTubeIcon className="text-red-500" size={14} />
                      <span className="text-gray-500 text-xs font-medium">YouTube Music</span>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <FavoritesManager songId={song.id} />
                  </div>
                </div>
              </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
