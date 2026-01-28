import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getRelease, getPlatformPlans } from '@/lib/release-planning-service'
import { generateTimeline } from '@/lib/timeline-generator'
import { generatePlatformPlans } from '@/lib/platform-plan-generator'
import type { ReleasePlatform } from '@/types/release-planning'

export const dynamic = 'force-dynamic'

// POST: Manually trigger timeline and platform plan generation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API] ===== GENERATE TIMELINE & PLATFORMS REQUEST =====')
    console.log('[API] Release ID:', params.id)
    
    if (!(await isAdminAuthenticated(request))) {
      console.error('[API] Unauthorized request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const release = await getRelease(params.id)
    console.log('[API] Release:', {
      id: release.id,
      songTitle: release.song_title,
      city: release.city,
      releaseAt: release.release_at,
    })
    
    const existingPlans = await getPlatformPlans(params.id)
    console.log('[API] Existing platform plans:', existingPlans.length)

    // Get platforms from request body or use defaults
    let platforms: ReleasePlatform[] = []
    try {
      const body = await request.json().catch(() => ({}))
      if (body.platforms && Array.isArray(body.platforms) && body.platforms.length > 0) {
        platforms = body.platforms as ReleasePlatform[]
      } else if (existingPlans.length > 0) {
        platforms = existingPlans.map(p => p.platform)
      } else {
        // Default platforms if none specified
        platforms = ['youtube', 'instagram_reels', 'tiktok', 'twitter'] as ReleasePlatform[]
      }
    } catch {
      // If no body, use defaults
      if (existingPlans.length > 0) {
        platforms = existingPlans.map(p => p.platform)
      } else {
        platforms = ['youtube', 'instagram_reels', 'tiktok', 'twitter'] as ReleasePlatform[]
      }
    }

    // Generate timeline
    console.log('[API] Generating timeline...')
    const timelineResult = await generateTimeline(release)
    console.log('[API] Timeline generated:', {
      promotionDays: timelineResult.promotionDays?.length || 0,
      dailyTasks: timelineResult.dailyTasks?.length || 0,
    })

    // Generate platform plans
    console.log('[API] Generating platform plans for:', platforms)
    const platformPlans = await generatePlatformPlans(release, platforms, 'spread')
    console.log('[API] Platform plans generated:', platformPlans.length)

    console.log('[API] ===== GENERATION COMPLETE =====')
    return NextResponse.json({
      success: true,
      message: 'Timeline and platform plans generated successfully',
      timeline: {
        days: timelineResult.promotionDays.length,
        tasks: timelineResult.dailyTasks.length,
      },
      platformPlans: platformPlans.length,
    })
  } catch (error: any) {
    console.error('[API] ===== GENERATION ERROR =====')
    console.error('[API] Error type:', error?.constructor?.name)
    console.error('[API] Error message:', error?.message)
    console.error('[API] Error stack:', error?.stack)
    console.error('[API] Full error:', error)
    console.error('[API] ============================')
    return NextResponse.json(
      { error: error.message || 'Failed to generate timeline and platform plans' },
      { status: 500 }
    )
  }
}
