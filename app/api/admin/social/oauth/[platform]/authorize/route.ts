import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getAuthorizationUrl } from '@/lib/oauth/base'
import type { SocialPlatform } from '@/types/social-media'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const platform = params.platform as SocialPlatform

    const { url, state } = await getAuthorizationUrl(platform)

    // Store state in cookie for verification
    const response = NextResponse.redirect(url)
    response.cookies.set(`oauth_state_${platform}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    })

    return response
  } catch (error: any) {
    console.error('[API] Error generating OAuth URL:', error)
    const errorMessage = error.message || 'Failed to generate OAuth URL'
    
    // Redirect to integrations page with error message
    return NextResponse.redirect(
      `/admin/social/integrations?error=${encodeURIComponent(errorMessage)}`
    )
  }
}
