// Analytics and Event Tracking
import { GA_MEASUREMENT_ID } from './ga-config'

interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
}

// Track events for Google Analytics
export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if ((window as any).gtag) {
    ;(window as any).gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    })
  }

  // Custom analytics (you can add other providers here)
  console.log('Analytics Event:', event)
}

// Track page views
export function trackPageView(url: string) {
  if (typeof window === 'undefined') return

  if ((window as any).gtag) {
    ;(window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Track user actions
export const trackActions = {
  // Video/Set actions
  videoPlay: (videoId: string, videoTitle: string) => {
    trackEvent({
      action: 'play',
      category: 'Video',
      label: videoTitle,
    })
  },
  videoPause: (videoId: string, videoTitle: string) => {
    trackEvent({
      action: 'pause',
      category: 'Video',
      label: videoTitle,
    })
  },
  videoComplete: (videoId: string, videoTitle: string) => {
    trackEvent({
      action: 'complete',
      category: 'Video',
      label: videoTitle,
    })
  },

  // Search actions
  search: (query: string, resultsCount: number) => {
    trackEvent({
      action: 'search',
      category: 'Search',
      label: query,
      value: resultsCount,
    })
  },

  // Favorite actions
  favoriteAdd: (itemId: string, itemType: string) => {
    trackEvent({
      action: 'favorite_add',
      category: 'Favorite',
      label: `${itemType}:${itemId}`,
    })
  },
  favoriteRemove: (itemId: string, itemType: string) => {
    trackEvent({
      action: 'favorite_remove',
      category: 'Favorite',
      label: `${itemType}:${itemId}`,
    })
  },

  // Playlist actions
  playlistAdd: (itemId: string, itemType: string) => {
    trackEvent({
      action: 'playlist_add',
      category: 'Playlist',
      label: `${itemType}:${itemId}`,
    })
  },
  playlistPlay: (itemsCount: number) => {
    trackEvent({
      action: 'playlist_play',
      category: 'Playlist',
      value: itemsCount,
    })
  },

  // Share actions
  share: (platform: string, itemId: string, itemType: string) => {
    trackEvent({
      action: 'share',
      category: 'Share',
      label: `${platform}:${itemType}:${itemId}`,
    })
  },

  // Newsletter actions
  newsletterSubscribe: () => {
    trackEvent({
      action: 'subscribe',
      category: 'Newsletter',
    })
  },

  // Link clicks
  linkClick: (platform: string, url: string) => {
    trackEvent({
      action: 'click',
      category: 'Link',
      label: `${platform}:${url}`,
    })
  },

  // City/Set views
  cityView: (cityId: string, cityName: string) => {
    trackEvent({
      action: 'view',
      category: 'City',
      label: cityName,
    })
  },
  setView: (setId: string, setName: string) => {
    trackEvent({
      action: 'view',
      category: 'Set',
      label: setName,
    })
  },
}
