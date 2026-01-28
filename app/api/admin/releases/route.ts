import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { createRelease, getReleases, updateRelease } from '@/lib/release-planning-service'
import { generateTimeline } from '@/lib/timeline-generator'
import { generatePlatformPlans } from '@/lib/platform-plan-generator'
import { getClientIP, rateLimit, validateString } from '@/lib/security'
import type { ReleasePlatform } from '@/types/release-planning'

export const dynamic = 'force-dynamic'

// GET: List releases
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as any

    const releases = await getReleases({ status })
    return NextResponse.json(releases)
  } catch (error: any) {
    console.error('[API] Error fetching releases:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch releases' },
      { status: 500 }
    )
  }
}

// POST: Create release
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`release-create:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 10,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validation
    const titleValidation = validateString(body.song_title, {
      required: true,
      minLength: 1,
      maxLength: 200,
    })

    if (!titleValidation.valid) {
      return NextResponse.json(
        { error: 'Song title is required and must be 1-200 characters' },
        { status: 400 }
      )
    }

    if (!body.local_language || !body.local_language_code) {
      return NextResponse.json(
        { error: 'Local language and language code are required' },
        { status: 400 }
      )
    }

    if (!body.release_at) {
      return NextResponse.json(
        { error: 'Release date and time are required' },
        { status: 400 }
      )
    }

    const release = await createRelease({
      song_title: titleValidation.value!,
      city: body.city || undefined,
      country: body.country || undefined,
      local_language: body.local_language,
      local_language_code: body.local_language_code,
      include_english: body.include_english || false,
      release_at: body.release_at,
      timezone: body.timezone || 'Europe/Istanbul',
    })

    // Update status to planning
    const updatedRelease = await updateRelease(release.id, { status: 'planning' })

    // Return response immediately, generation will happen in background
    const platforms = (body.platforms || []) as ReleasePlatform[]
    
    // Start generation in background (fire and forget)
    // Don't await - let it run asynchronously
    Promise.all([
      generateTimeline(updatedRelease).catch(error => {
        console.error('[Background] Error generating timeline:', error)
      }),
      platforms.length > 0 
        ? generatePlatformPlans(updatedRelease, platforms, 'spread').catch(error => {
            console.error('[Background] Error generating platform plans:', error)
          })
        : Promise.resolve(),
    ]).catch(error => {
      console.error('[Background] Error in generation:', error)
    })

    return NextResponse.json(updatedRelease, { status: 201 })
  } catch (error: any) {
    console.error('[API] Error creating release:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create release' },
      { status: 500 }
    )
  }
}
