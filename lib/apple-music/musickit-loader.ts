// Apple Music MusicKit JS Loader
// MusicKit JS is loaded via CDN, not npm

declare global {
  interface Window {
    MusicKit?: any
  }
}

export async function loadMusicKit(): Promise<any> {
  if (typeof window === 'undefined') return null

  // Check if already loaded
  if (window.MusicKit) {
    return window.MusicKit
  }

  // Load MusicKit JS from CDN
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://js-cdn.music.apple.com/musickit/v1/musickit.js'
    script.async = true
    script.onload = () => {
      if (window.MusicKit) {
        resolve(window.MusicKit)
      } else {
        reject(new Error('MusicKit failed to load'))
      }
    }
    script.onerror = () => {
      reject(new Error('Failed to load MusicKit script'))
    }
    document.head.appendChild(script)
  })
}

export async function initializeMusicKit(developerToken: string) {
  const MusicKit = await loadMusicKit()
  
  if (!MusicKit) {
    throw new Error('MusicKit not available')
  }

  try {
    await MusicKit.configure({
      developerToken,
      app: {
        name: 'CALI Club',
        build: '1.0.0',
      },
    })

    return MusicKit.getInstance()
  } catch (error) {
    console.error('MusicKit initialization error:', error)
    throw error
  }
}
