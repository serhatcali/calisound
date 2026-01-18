'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { ConcertVenue } from './ConcertVenue'
import { SongList } from './SongList'
import { CharacterCreatorModal } from './CharacterCreatorModal'
import { ChatPanel } from './ChatPanel'
import { LoadingScreen } from './LoadingScreen'
import { YouTubePlayer } from './YouTubePlayer'
import { MusicPlayer } from './MusicPlayer'
import { CharacterNameFixer } from './CharacterNameFixer'
import { useCaliClubRealtime } from '@/hooks/useCaliClubRealtime'
import { useCaliClubStore } from '@/stores/cali-club-store'
import { ToastContainer } from './Toast'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  // Ignore YouTube player errors - don't show error UI
  const errorMessage = error.message || ''
  const errorStack = error.stack || ''
  
  if (
    errorMessage.includes('getDuration') ||
    errorMessage.includes('getCurrentTime') ||
    errorMessage.includes('www-widgetapi') ||
    errorMessage.includes('youtube.com') ||
    errorMessage.includes('googletagmanager.com') ||
    errorMessage.includes('gtag/js') ||
    errorStack.includes('www-widgetapi') ||
    errorStack.includes('youtube.com') ||
    errorStack.includes('googletagmanager.com') ||
    errorStack.includes('gtag/js')
  ) {
    console.debug('[ErrorFallback] Ignoring YouTube player error, not showing UI')
    // Return null to hide error UI
    return null
  }
  
  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h2 className="text-white text-xl font-bold mb-2">An error occurred</h2>
        <p className="text-gray-400 text-sm mb-4">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg hover:from-yellow-600 hover:to-amber-600 transition-colors shadow-lg shadow-yellow-500/30"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

export function CaliClubClient() {
  // Initialize realtime subscriptions
  useCaliClubRealtime()
  const cleanupExecuted = useRef(false)
  const scrollPrevented = useRef(false)
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false)
  const { currentSong, isPlaying, setIsPlaying, songs } = useCaliClubStore()
  
  // Extract video ID from song
  const getVideoId = (song: any) => {
    if (!song) return null
    if (song.id && song.id.length === 11) return song.id
    if (song.apple_music_id && song.apple_music_id.length === 11) return song.apple_music_id
    const url = song.preview_url || song.apple_music_url || song.youtube_url || ''
    const match = url.match(/(?:embed\/|watch\?v=|\/)([a-zA-Z0-9_-]{11})/)
    if (match) return match[1]
    return null
  }

  // Function to delete character when user leaves
  const deleteCharacterOnLeave = (characterId: string | null, sessionId: string | null) => {
    if (!characterId && !sessionId) return

    // Use sendBeacon for reliable cleanup (works even when page is closing)
    // sendBeacon only supports POST, so we use a cleanup endpoint
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        id: characterId,
        session_id: sessionId,
      })
      const blob = new Blob([data], { type: 'application/json' })
      navigator.sendBeacon('/api/cali-club/characters/cleanup', blob)
    } else {
      // Fallback to fetch (may not work if page is closing)
      fetch('/api/cali-club/characters/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: characterId,
          session_id: sessionId,
        }),
        keepalive: true, // Keep request alive even after page unload
      }).catch((error) => {
        console.error('Error deleting character on leave:', error)
      })
    }
  }

  // Cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (cleanupExecuted.current) return
      cleanupExecuted.current = true

      const characterId = localStorage.getItem('cali_club_character_id')
      const sessionId = localStorage.getItem('cali_club_session_id')

      if (characterId || sessionId) {
        deleteCharacterOnLeave(characterId, sessionId)
      }
    }

    const handlePageHide = () => {
      if (cleanupExecuted.current) return
      cleanupExecuted.current = true

      const characterId = localStorage.getItem('cali_club_character_id')
      const sessionId = localStorage.getItem('cali_club_session_id')

      if (characterId || sessionId) {
        deleteCharacterOnLeave(characterId, sessionId)
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)

      // Also cleanup on component unmount
      const characterId = localStorage.getItem('cali_club_character_id')
      const sessionId = localStorage.getItem('cali_club_session_id')

      if (characterId || sessionId) {
        deleteCharacterOnLeave(characterId, sessionId)
      }
    }
  }, [])

  // Prevent auto-scroll on page load
  useEffect(() => {
    if (scrollPrevented.current) return
    scrollPrevented.current = true
    
    // Immediately scroll to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    
    // Prevent scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    
    // Remove any hash from URL that might cause scroll
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    
    // Aggressively prevent scroll for first 2 seconds
    let scrollPreventionCount = 0
    const maxPreventions = 20 // 2 seconds (20 * 100ms)
    
    const preventScroll = () => {
      if (scrollPreventionCount < maxPreventions) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
        scrollPreventionCount++
      } else {
        clearInterval(intervalId)
      }
    }
    
    const intervalId = setInterval(preventScroll, 100)
    
    // Also prevent on focus
    const handleFocus = () => {
      if (scrollPreventionCount < maxPreventions) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      }
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Restore character from localStorage on mount
  useEffect(() => {
    const savedCharacterId = localStorage.getItem('cali_club_character_id')
    const savedSessionId = localStorage.getItem('cali_club_session_id')

    if (savedCharacterId && savedSessionId) {
      // Character will be loaded via realtime subscription
      // We just need to set it as current when it arrives
      const checkCharacter = setInterval(() => {
        const { characters } = useCaliClubStore.getState()
        const character = characters.find((c) => c.id === savedCharacterId)
        if (character) {
          useCaliClubStore.getState().setCurrentCharacter(character)
          clearInterval(checkCharacter)
        }
      }, 500)

      // Stop checking after 5 seconds
      setTimeout(() => clearInterval(checkCharacter), 5000)
    }
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: '/',
      ctrlKey: true,
      action: () => {
        // Focus search if available
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: 'Focus search',
    },
    {
      key: 'Escape',
      action: () => {
        // Close modals, clear focus
        const activeElement = document.activeElement as HTMLElement
        if (activeElement && activeElement.blur) {
          activeElement.blur()
        }
      },
      description: 'Close/Clear focus',
    },
  ])

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error: Error, errorInfo: { componentStack: string }) => {
        // Ignore YouTube player internal errors
        const errorMessage = error.message || ''
        const errorStack = error.stack || ''
        const componentStack = errorInfo.componentStack || ''
        
        if (
          errorMessage.includes('getDuration') ||
          errorMessage.includes('getCurrentTime') ||
          errorMessage.includes('www-widgetapi') ||
          errorMessage.includes('youtube.com') ||
          errorMessage.includes('googletagmanager.com') ||
          errorMessage.includes('gtag/js') ||
          errorStack.includes('www-widgetapi') ||
          errorStack.includes('youtube.com') ||
          errorStack.includes('googletagmanager.com') ||
          errorStack.includes('gtag/js') ||
          componentStack.includes('www-widgetapi') ||
          componentStack.includes('youtube.com') ||
          componentStack.includes('googletagmanager.com')
        ) {
          console.debug('[ErrorBoundary] Ignoring YouTube player error:', errorMessage)
          // Don't show error UI for YouTube player errors
          return
        }
        // Log other errors
        console.error('[ErrorBoundary] Error:', error, errorInfo)
      }}
    >
      <div className="w-full h-full bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/3 via-transparent to-amber-500/3 pointer-events-none" />
        
        {/* Toast Notifications */}
        <ToastContainer />
        
        <Suspense fallback={<LoadingScreen />}>
          {/* Character Name Fixer - Automatically fixes character names to C1, C2, C3, C4 format */}
          <CharacterNameFixer />
          
          <div className="h-screen w-full flex flex-col lg:flex-row relative z-10 overflow-hidden">
          {/* Left Sidebar - Song List & Character Creator */}
          <div className="w-full lg:w-80 bg-gradient-to-b from-black via-black to-gray-950 backdrop-blur-2xl border-r-2 border-gray-900/50 flex flex-col order-2 lg:order-1 shadow-[0_0_50px_rgba(234,179,8,0.1)] overflow-hidden">
            <div className="p-5 border-b-2 border-gray-900/50 bg-gradient-to-br from-yellow-500/10 via-amber-500/8 to-yellow-600/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/3 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-lg">🎧</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black mb-0.5 bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent leading-tight">
                      CALI Club
                    </h1>
                    <p className="text-xs text-gray-500 font-medium">Virtual Concert</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Character Creator Button */}
            <div className="p-5 border-b-2 border-gray-900/50 bg-gradient-to-b from-black/80 to-black/40">
              <button
                onClick={() => setIsCharacterModalOpen(true)}
                className="w-full px-4 py-3 bg-gradient-to-br from-yellow-500/20 via-amber-500/15 to-yellow-600/20 border-2 border-yellow-500/30 text-yellow-300 rounded-xl font-semibold hover:from-yellow-500/30 hover:via-amber-500/25 hover:to-yellow-600/30 hover:border-yellow-500/50 transition-all shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 flex items-center justify-center gap-2"
              >
                <span className="text-lg">👤</span>
                <span>Manage Character</span>
              </button>
            </div>

            {/* Song List & Player */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <SongList />
            </div>
          </div>

          {/* Main Area - Concert Venue (3D) */}
          <div className="flex-1 relative order-1 lg:order-2 min-h-0 bg-gradient-to-b from-black via-gray-950 to-black flex flex-col overflow-hidden">
            <div 
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background: 'radial-gradient(circle at center, rgba(249, 115, 22, 0.1) 0%, transparent 70%)',
              }}
            />
            {/* Concert Venue - Takes remaining space, leaves room for player */}
            <div className="flex-1 relative min-h-0 overflow-hidden z-10">
              <ConcertVenue />
            </div>
            
            {/* YouTube Player - Hidden, only for audio, always rendered */}
            <YouTubePlayer
              key={currentSong && getVideoId(currentSong) ? getVideoId(currentSong) : 'empty'}
              videoId={currentSong && getVideoId(currentSong) ? getVideoId(currentSong)! : ''}
              isPlaying={isPlaying}
              onStateChange={setIsPlaying}
              allowedVideoIds={songs.map(s => {
                if (!s) return null
                if (s.id && s.id.length === 11) return s.id
                if (s.apple_music_id && s.apple_music_id.length === 11) return s.apple_music_id
                const url = s.preview_url || s.apple_music_url || s.youtube_url || ''
                const match = url.match(/(?:embed\/|watch\?v=|\/)([a-zA-Z0-9_-]{11})/)
                return match ? match[1] : null
              }).filter(Boolean) as string[]}
            />
            
            {/* Custom Music Player - Always visible, fixed at bottom of concert area */}
            <div className="relative z-20 flex-shrink-0">
              <MusicPlayer
                videoId={currentSong && getVideoId(currentSong) ? getVideoId(currentSong)! : ''}
                isPlaying={isPlaying}
                onStateChange={setIsPlaying}
              />
            </div>
          </div>

          {/* Right Sidebar - Chat */}
          <div className="w-full lg:w-80 bg-gradient-to-b from-black via-black to-gray-950 backdrop-blur-2xl border-l-2 border-gray-900/50 order-3 shadow-[0_0_50px_rgba(234,179,8,0.1)] overflow-hidden">
            <ChatPanel />
          </div>
          </div>
        </Suspense>
        
        {/* Character Creator Modal */}
        <CharacterCreatorModal 
          isOpen={isCharacterModalOpen}
          onClose={() => setIsCharacterModalOpen(false)}
        />
      </div>
    </ErrorBoundary>
  )
}
