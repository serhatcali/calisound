import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { exchangeCodeForToken, saveOAuthAccount } from '@/lib/oauth/base'
import { getOAuthConfig } from '@/lib/oauth/config'
import type { SocialPlatform } from '@/types/social-media'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.redirect('/admin/login?error=unauthorized')
    }

    const platform = params.platform as SocialPlatform
    const { searchParams } = new URL(request.url)

    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        `/admin/social/integrations?error=${encodeURIComponent(error)}`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        '/admin/social/integrations?error=missing_code_or_state'
      )
    }

    // Verify state from cookie
    const cookieState = request.cookies.get(`oauth_state_${platform}`)?.value
    if (cookieState !== state) {
      return NextResponse.redirect(
        '/admin/social/integrations?error=invalid_state'
      )
    }

    // Exchange code for token
    const tokenData = await exchangeCodeForToken(platform, code, state)

    // Get user info from platform API
    const config = getOAuthConfig(platform)
    if (!config) {
      throw new Error('OAuth config not found')
    }

    let handle = 'unknown'
    let accountId: string | undefined

    // Platform-specific user info fetching
    if (platform === 'youtube' || platform === 'youtube_shorts') {
      const userResponse = await fetch(
        `${config.apiBaseUrl}/channels?part=snippet&mine=true`,
        {
          headers: {
            Authorization: `Bearer ${tokenData.accessToken}`,
          },
        }
      )
      if (userResponse.ok) {
        const userData = await userResponse.json()
        if (userData.items?.[0]) {
          handle = userData.items[0].snippet.customUrl || userData.items[0].snippet.title
          accountId = userData.items[0].id
        }
      }
    } else if (platform === 'instagram' || platform === 'instagram_story') {
      // Instagram Basic Display API - get user info
      try {
        const userResponse = await fetch(
          `${config.apiBaseUrl}/me?fields=id,username`,
          {
            headers: {
              Authorization: `Bearer ${tokenData.accessToken}`,
            },
          }
        )
        if (userResponse.ok) {
          const userData = await userResponse.json()
          handle = userData.username || 'unknown'
          accountId = userData.id
        } else {
          // Fallback: try Meta Graph API if Basic Display doesn't work
          const metaResponse = await fetch(
            `https://graph.facebook.com/v18.0/me?fields=id,name,username`,
            {
              headers: {
                Authorization: `Bearer ${tokenData.accessToken}`,
              },
            }
          )
          if (metaResponse.ok) {
            const metaData = await metaResponse.json()
            handle = metaData.username || metaData.name || 'unknown'
            accountId = metaData.id
          }
        }
      } catch (error) {
        console.error('Error fetching Instagram user info:', error)
        // Use token data as fallback
        handle = 'instagram_user'
      }
    } else if (platform === 'facebook') {
      // Meta Graph API - get user info
      const userResponse = await fetch(
        `${config.apiBaseUrl}/me?fields=id,name,username`,
        {
          headers: {
            Authorization: `Bearer ${tokenData.accessToken}`,
          },
        }
      )
      if (userResponse.ok) {
        const userData = await userResponse.json()
        handle = userData.username || userData.name || 'unknown'
        accountId = userData.id
      }
    } else if (platform === 'twitter') {
      const userResponse = await fetch(`${config.apiBaseUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${tokenData.accessToken}`,
        },
      })
      if (userResponse.ok) {
        const userData = await userResponse.json()
        handle = userData.data?.username || 'unknown'
        accountId = userData.data?.id
      }
    }

    // Save account
    await saveOAuthAccount(platform, {
      handle,
      accountId,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresIn: tokenData.expiresIn,
      scopes: config.scopes,
    })

    // Clear state cookie
    const response = NextResponse.redirect('/admin/social/integrations?success=connected')
    response.cookies.delete(`oauth_state_${platform}`)

    return response
  } catch (error: any) {
    console.error('[API] Error in OAuth callback:', error)
    return NextResponse.redirect(
      `/admin/social/integrations?error=${encodeURIComponent(error.message || 'oauth_failed')}`
    )
  }
}
