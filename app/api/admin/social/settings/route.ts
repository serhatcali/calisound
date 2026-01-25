import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getSocialSettings, updateSocialSetting } from '@/lib/social-settings-service'
import { getClientIP, rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

// GET: Get all settings
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await getSocialSettings()
    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('[API] Error fetching settings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT: Update settings
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-settings-update:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 30,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json(
        { error: 'key is required' },
        { status: 400 }
      )
    }

    const updated = await updateSocialSetting(key, value)
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('[API] Error updating setting:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update setting' },
      { status: 500 }
    )
  }
}
