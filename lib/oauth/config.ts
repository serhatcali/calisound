/**
 * OAuth Configuration
 * Platform-specific OAuth settings
 */

import type { SocialPlatform } from '@/types/social-media'

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
  authUrl: string
  tokenUrl: string
  apiBaseUrl: string
}

export function getOAuthConfig(platform: SocialPlatform): OAuthConfig | null {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const redirectUri = `${baseUrl}/api/admin/social/oauth/${platform}/callback`

  switch (platform) {
    case 'youtube':
    case 'youtube_shorts': {
      const clientId = process.env.YOUTUBE_CLIENT_ID
      const clientSecret = process.env.YOUTUBE_CLIENT_SECRET
      
      if (!clientId || !clientSecret) {
        return null
      }
      
      return {
        clientId,
        clientSecret,
        redirectUri,
        scopes: [
          'https://www.googleapis.com/auth/youtube.upload',
          'https://www.googleapis.com/auth/youtube',
          'https://www.googleapis.com/auth/youtube.force-ssl',
        ],
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        apiBaseUrl: 'https://www.googleapis.com/youtube/v3',
      }
    }

    case 'instagram':
    case 'instagram_story': {
      const clientId = process.env.INSTAGRAM_APP_ID
      const clientSecret = process.env.INSTAGRAM_APP_SECRET
      
      if (!clientId || !clientSecret) {
        return null
      }
      
      // Instagram Basic Display API (daha kolay erişim)
      // Instagram Graph API için business verification gerekir
      return {
        clientId,
        clientSecret,
        redirectUri,
        scopes: [
          'user_profile',
          'user_media',
        ],
        authUrl: 'https://api.instagram.com/oauth/authorize',
        tokenUrl: 'https://api.instagram.com/oauth/access_token',
        apiBaseUrl: 'https://graph.instagram.com',
      }
    }

    case 'facebook': {
      const clientId = process.env.FACEBOOK_APP_ID
      const clientSecret = process.env.FACEBOOK_APP_SECRET
      
      if (!clientId || !clientSecret) {
        return null
      }
      
      return {
        clientId,
        clientSecret,
        redirectUri,
        scopes: [
          'pages_manage_posts',
          'pages_read_engagement',
          'pages_show_list',
        ],
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        apiBaseUrl: 'https://graph.facebook.com/v18.0',
      }
    }

    case 'twitter': {
      const clientId = process.env.TWITTER_CLIENT_ID
      const clientSecret = process.env.TWITTER_CLIENT_SECRET
      
      if (!clientId || !clientSecret) {
        return null
      }
      
      return {
        clientId,
        clientSecret,
        redirectUri,
        scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        apiBaseUrl: 'https://api.twitter.com/2',
      }
    }

    case 'tiktok': {
      const clientId = process.env.TIKTOK_CLIENT_KEY
      const clientSecret = process.env.TIKTOK_CLIENT_SECRET
      
      if (!clientId || !clientSecret) {
        return null
      }
      
      return {
        clientId,
        clientSecret,
        redirectUri,
        scopes: [
          'user.info.basic',
          'video.upload',
          'video.publish',
        ],
        authUrl: 'https://www.tiktok.com/v2/auth/authorize',
        tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token',
        apiBaseUrl: 'https://open.tiktokapis.com/v2',
      }
    }

    default:
      return null
  }
}

export function isOAuthEnabled(platform: SocialPlatform): boolean {
  const config = getOAuthConfig(platform)
  return !!(config?.clientId && config?.clientSecret)
}
