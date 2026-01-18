'use client'

import { useEffect, useRef, useState } from 'react'
import { useCaliClubStore } from '@/stores/cali-club-store'

interface YouTubePlayerProps {
  videoId: string
  isPlaying: boolean
  onStateChange?: (isPlaying: boolean) => void
  allowedVideoIds?: string[] // Only allow embedding of these video IDs
}

// Global player instance to prevent unmount issues
let globalPlayer: any = null
let globalPlayerElement: HTMLDivElement | null = null
let globalIsReady = false
let globalVideoId: string | null = null

export function YouTubePlayer({ videoId, isPlaying, onStateChange, allowedVideoIds }: YouTubePlayerProps) {
  const [mounted, setMounted] = useState(false)
  const { currentSong } = useCaliClubStore()
  
  // Security check: Only allow embedding of allowed video IDs
  const isAllowed = !videoId || !allowedVideoIds || allowedVideoIds.length === 0 || allowedVideoIds.includes(videoId)
  
  useEffect(() => {
    setMounted(true)
    
    // Create hidden global player element if it doesn't exist
    if (!globalPlayerElement && typeof document !== 'undefined') {
      globalPlayerElement = document.createElement('div')
      globalPlayerElement.id = 'youtube-player-container'
      // Hide the container - we only need audio
      globalPlayerElement.style.position = 'absolute'
      globalPlayerElement.style.width = '1px'
      globalPlayerElement.style.height = '1px'
      globalPlayerElement.style.opacity = '0'
      globalPlayerElement.style.pointerEvents = 'none'
      globalPlayerElement.style.zIndex = '-1'
      globalPlayerElement.style.overflow = 'hidden'
      document.body.appendChild(globalPlayerElement)
    }
    
    // Add global error handler to catch YouTube player errors
    const handleError = (event: ErrorEvent) => {
      // Silently catch YouTube player internal errors
      const errorMessage = event.message || event.error?.message || ''
      const errorStack = event.error?.stack || ''
      const filename = event.filename || ''
      
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
        filename.includes('www-widgetapi') ||
        filename.includes('youtube.com') ||
        filename.includes('googletagmanager.com') ||
        filename.includes('gtag/js')
      ) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        console.debug('[YouTubePlayer] Caught YouTube player internal error:', errorMessage)
        return true
      }
      return false
    }
    
    // Also catch unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && (
        (typeof event.reason === 'string' && (
          event.reason.includes('getDuration') ||
          event.reason.includes('getCurrentTime')
        )) ||
        (event.reason?.message && (
          event.reason.message.includes('getDuration') ||
          event.reason.message.includes('getCurrentTime')
        ))
      )) {
        event.preventDefault()
        console.debug('[YouTubePlayer] Caught YouTube player promise rejection:', event.reason)
        return true
      }
      return false
    }
    
    // Use capture phase to catch errors before they bubble up
    window.addEventListener('error', handleError, true)
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true)
    
    return () => {
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true)
      // Don't remove the element on unmount - keep it for reuse
      // This prevents removeChild errors
    }
  }, [])
  
  // All hooks must be called before any conditional returns
  useEffect(() => {
    // Early return if not allowed or no videoId
    if (!videoId || !isAllowed) {
      return
    }
    
    console.log('[YouTubePlayer] Effect triggered for videoId:', videoId)
    
    // If player already exists and is ready, just load the new video
    if (globalPlayer && globalIsReady && globalVideoId !== videoId) {
      try {
        console.log('[YouTubePlayer] Player exists, loading new video:', videoId)
        globalPlayer.loadVideoById(videoId)
        globalVideoId = videoId
        return // Don't reinitialize
      } catch (e) {
        console.error('[YouTubePlayer] Error loading video:', e)
        // If loadVideoById fails, we'll reinitialize below
      }
    }
    
    // If videoId hasn't changed and player exists, don't reinitialize
    if (globalPlayer && globalIsReady && globalVideoId === videoId) {
      console.log('[YouTubePlayer] Player already initialized for this video')
      return
    }

    // Load YouTube IFrame API
    if (!(window as any).YT) {
      console.log('[YouTubePlayer] Loading YouTube IFrame API...')
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    // Initialize player when API is ready
    const initializePlayer = () => {
      // Early return if not allowed or no videoId
      if (!videoId || !isAllowed) {
        return
      }
      
      console.log('[YouTubePlayer] Attempting to initialize player...')
      
      if (!globalPlayerElement) {
        console.warn('[YouTubePlayer] globalPlayerElement is null')
        return
      }
      if (!(window as any).YT) {
        console.warn('[YouTubePlayer] YT is not available')
        return
      }
      if (!(window as any).YT.Player) {
        console.warn('[YouTubePlayer] YT.Player is not available')
        return
      }
      
      // If player already exists, don't create a new one
      if (globalPlayer) {
        console.log('[YouTubePlayer] Player already exists, loading video:', videoId)
        try {
          globalPlayer.loadVideoById(videoId)
          globalVideoId = videoId
        } catch (e) {
          console.error('[YouTubePlayer] Error loading video:', e)
        }
        return
      }
      
      try {
        console.log('[YouTubePlayer] Creating new player instance for videoId:', videoId)
        // Create a hidden container for the YouTube player (audio only)
        let playerContainer = globalPlayerElement.querySelector('.youtube-player-inner') as HTMLDivElement
        if (!playerContainer) {
          playerContainer = document.createElement('div')
          playerContainer.className = 'youtube-player-inner'
          // Hide the YouTube player - we only need audio
          playerContainer.style.position = 'absolute'
          playerContainer.style.width = '1px'
          playerContainer.style.height = '1px'
          playerContainer.style.opacity = '0'
          playerContainer.style.pointerEvents = 'none'
          playerContainer.style.zIndex = '-1'
          globalPlayerElement.appendChild(playerContainer)
        }
        
        // Protect player container before initialization
        // This prevents Google Tag Manager from accessing the player before it's ready
        const playerInstanceRef: { current: any } = { current: null }
        Object.defineProperty(playerContainer, 'player', {
          get: () => {
            if (!playerInstanceRef.current) {
              // Return a safe stub player until the real one is ready
              return new Proxy({}, {
                get: (target, prop) => {
                  if (prop === 'getDuration') {
                    return () => 0
                  }
                  if (prop === 'getCurrentTime') {
                    return () => 0
                  }
                  if (prop === 'getPlayerState') {
                    return () => -1 // UNSTARTED
                  }
                  // Return no-op functions for other methods
                  if (typeof prop === 'string' && prop.startsWith('get')) {
                    return () => null
                  }
                  if (typeof prop === 'string' && (prop.includes('play') || prop.includes('pause') || prop.includes('seek'))) {
                    return () => {}
                  }
                  return undefined
                },
                has: () => true, // Make it appear to have all properties
                ownKeys: () => ['getDuration', 'getCurrentTime', 'getPlayerState', 'playVideo', 'pauseVideo', 'seekTo'],
              })
            }
            return playerInstanceRef.current
          },
          set: (value) => {
            playerInstanceRef.current = value
            return true
          },
          configurable: true,
          enumerable: true
        })
        
        const newPlayer = new (window as any).YT.Player(playerContainer, {
          videoId: videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            playsinline: 1,
            disablekb: 1,
            fs: 0,
            cc_load_policy: 0,
            enablejsapi: 1,
            loop: 0,
            mute: 0,
            start: 0,
            // Prevent errors by ensuring player is fully ready
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              try {
                // Ensure player is ready and methods are available
                if (!event.target || typeof event.target.getPlayerState !== 'function') {
                  console.warn('[YouTubePlayer] Player ready but methods not available')
                  return
                }
                
                console.log('[YouTubePlayer] Player ready for videoId:', videoId)
                globalIsReady = true
                globalVideoId = videoId
                
                // Create a completely protected player proxy
                // This prevents Google Tag Manager and other scripts from calling getDuration
                const protectedPlayer = new Proxy(event.target, {
                  get: (target, prop) => {
                    // Always provide a safe getDuration method
                    if (prop === 'getDuration') {
                      return function() {
                        try {
                          // Check if the actual method exists and is callable
                          if (target && typeof target.getDuration === 'function') {
                            return target.getDuration()
                          }
                          // Return 0 if method not available (player not fully ready)
                          return 0
                        } catch (e) {
                          // Silently catch all errors
                          console.debug('[YouTubePlayer] getDuration error suppressed:', e)
                          return 0
                        }
                      }
                    }
                    // For all other properties, return as normal
                    const value = (target as any)[prop]
                    if (typeof value === 'function') {
                      // Bind functions to the original target
                      return value.bind(target)
                    }
                    return value
                  },
                  set: (target, prop, value) => {
                    // Allow setting properties
                    ;(target as any)[prop] = value
                    return true
                  },
                  has: (target, prop) => {
                    // Always return true for getDuration to make it appear available
                    if (prop === 'getDuration') return true
                    return prop in target
                  },
                  ownKeys: (target) => {
                    // Include getDuration in own keys
                    const keys = Reflect.ownKeys(target)
                    if (!keys.includes('getDuration')) {
                      return [...keys, 'getDuration']
                    }
                    return keys
                  }
                })
                
                // Store protected player globally
                globalPlayer = protectedPlayer
                ;(window as any).globalYouTubePlayer = protectedPlayer
                
                // Update the player container's player property with the protected version
                try {
                  if (playerContainer) {
                    // Update the player instance in the container
                    playerInstanceRef.current = protectedPlayer
                  }
                } catch (e) {
                  console.debug('[YouTubePlayer] Could not update player container:', e)
                }
                // Auto-play if isPlaying is true
                if (isPlaying) {
                  console.log('[YouTubePlayer] Auto-playing video')
                  const playAttempts = [100, 300, 500]
                  playAttempts.forEach((delay) => {
                    setTimeout(() => {
                      try {
                        if (event.target && typeof event.target.getPlayerState === 'function' && typeof event.target.playVideo === 'function') {
                          const playerState = event.target.getPlayerState()
                          console.log('[YouTubePlayer] Current player state:', playerState, 'attempting to play...')
                          if (playerState !== 1) {
                            event.target.playVideo()
                          }
                        }
                      } catch (e) {
                        console.error('[YouTubePlayer] Error auto-playing:', e)
                      }
                    }, delay)
                  })
                }
              } catch (error) {
                console.error('[YouTubePlayer] Error in onReady callback:', error)
              }
            },
            onStateChange: async (event: any) => {
              try {
                // Ensure player is ready and methods are available
                if (!event.target || typeof event.target.getPlayerState !== 'function') {
                  return
                }
                
                // Protect event.target from external scripts (like Google Tag Manager)
                // that might try to call getDuration during state change
                const safeEventTarget = new Proxy(event.target, {
                  get: (target, prop) => {
                    if (prop === 'getDuration') {
                      return function() {
                        try {
                          if (typeof target.getDuration === 'function') {
                            return target.getDuration()
                          }
                          return 0
                        } catch (e) {
                          console.debug('[YouTubePlayer] getDuration error in onStateChange:', e)
                          return 0
                        }
                      }
                    }
                    const value = (target as any)[prop]
                    if (typeof value === 'function') {
                      return value.bind(target)
                    }
                    return value
                  }
                })
                
                // Replace event.target with safe version for this callback
                const safeEvent = { ...event, target: safeEventTarget }
                
                const isNowPlaying = safeEvent.data === 1
                const stateNames = {
                  '-1': 'UNSTARTED',
                  '0': 'ENDED',
                  '1': 'PLAYING',
                  '2': 'PAUSED',
                  '3': 'BUFFERING',
                  '5': 'CUED'
                }
                console.log('[YouTubePlayer] State changed:', safeEvent.data, `(${stateNames[safeEvent.data] || 'UNKNOWN'})`, 'isPlaying:', isNowPlaying)
                
                if (safeEvent.data === 1) {
                  onStateChange?.(true)
                } else if (safeEvent.data === 2 || safeEvent.data === 0) {
                  onStateChange?.(false)
                } else if (safeEvent.data === 3 && isPlaying) {
                  console.log('[YouTubePlayer] Buffering detected, attempting to resume play...')
                  setTimeout(() => {
                    try {
                      if (safeEventTarget && typeof safeEventTarget.playVideo === 'function') {
                        safeEventTarget.playVideo()
                      }
                    } catch (e) {
                      console.error('[YouTubePlayer] Error resuming play:', e)
                    }
                  }, 500)
                }
                
                if (safeEvent.data === 1 || safeEvent.data === 2 || safeEvent.data === 0) {
                  try {
                    await fetch('/api/cali-club/state', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        is_playing: isNowPlaying,
                      }),
                    })
                  } catch (error) {
                    console.error('[YouTubePlayer] Error updating state from player:', error)
                  }
                }
              } catch (error) {
                // Silently catch any errors from YouTube player callbacks
                // This prevents errors from breaking the app
                console.debug('[YouTubePlayer] Error in onStateChange callback:', error)
              }
            },
            onError: (event: any) => {
              try {
                console.error('[YouTubePlayer] Player error:', event.data, 'for videoId:', videoId)
                onStateChange?.(false)
              } catch (error) {
                console.error('[YouTubePlayer] Error in onError callback:', error)
              }
            },
          },
        })
        console.log('[YouTubePlayer] Player instance created successfully')
      } catch (error) {
        console.error('[YouTubePlayer] Error creating player:', error)
      }
    }

    // Wait for API to be ready
    if ((window as any).YT && (window as any).YT.Player) {
      console.log('[YouTubePlayer] API already ready, initializing immediately')
      setTimeout(initializePlayer, 100)
    } else {
      console.log('[YouTubePlayer] Waiting for API to be ready...')
      const previousCallback = (window as any).onYouTubeIframeAPIReady
      ;(window as any).onYouTubeIframeAPIReady = () => {
        console.log('[YouTubePlayer] API ready callback fired')
        if (previousCallback) previousCallback()
        setTimeout(initializePlayer, 100)
      }
    }
  }, [videoId, isPlaying, onStateChange, isAllowed])

  useEffect(() => {
    // Early return if not allowed or no videoId
    if (!videoId || !isAllowed) {
      return
    }
    
    if (!globalPlayer || !globalIsReady) {
      console.log('[YouTubePlayer] Cannot control player - player:', !!globalPlayer, 'isReady:', globalIsReady)
      return
    }

    try {
      const currentState = globalPlayer.getPlayerState()
      console.log('[YouTubePlayer] Controlling player - isPlaying:', isPlaying, 'currentState:', currentState)
      
      if (isPlaying) {
        if (currentState !== 1) {
          console.log('[YouTubePlayer] Calling playVideo()')
          globalPlayer.playVideo()
          setTimeout(() => {
            const newState = globalPlayer.getPlayerState()
            if (newState !== 1 && isPlaying) {
              console.log('[YouTubePlayer] Retrying playVideo(), current state:', newState)
              globalPlayer.playVideo()
            }
          }, 1000)
        }
      } else {
        if (currentState === 1) {
          console.log('[YouTubePlayer] Calling pauseVideo()')
          globalPlayer.pauseVideo()
        }
      }
    } catch (error) {
      console.error('[YouTubePlayer] Error controlling player:', error)
    }
  }, [isPlaying, videoId, isAllowed])

  // Early return after all hooks - but only if videoId is empty or not allowed
  if (!videoId) {
    return null
  }
  
  if (!isAllowed) {
    console.warn(`[YouTubePlayer] Video ID ${videoId} is not allowed to be embedded. Allowed IDs:`, allowedVideoIds)
    return null
  }

  // Component doesn't render anything - player is managed globally
  // This prevents React from trying to unmount the player element
  return null
}
