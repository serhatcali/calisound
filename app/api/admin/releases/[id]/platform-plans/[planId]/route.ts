import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { updatePlatformPlan } from '@/lib/release-planning-service'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; planId: string } }
) {
  try {
    await requireAdmin()

    const { id: releaseId, planId } = params
    const body = await request.json()

    console.log('[API] Updating platform plan:', {
      releaseId,
      planId,
      planned_at: body.planned_at,
    })

    // Validate that we're only updating planned_at (for drag & drop)
    if (!body.planned_at) {
      console.error('[API] Missing planned_at in request body')
      return NextResponse.json(
        { success: false, error: 'Missing planned_at in request body' },
        { status: 400 }
      )
    }

    // Validate date format
    const plannedAtDate = new Date(body.planned_at)
    if (isNaN(plannedAtDate.getTime())) {
      console.error('[API] Invalid date format:', body.planned_at)
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 }
      )
    }

    const updatedPlan = await updatePlatformPlan(planId, {
      planned_at: body.planned_at,
    })

    console.log('[API] Platform plan updated successfully:', {
      planId: updatedPlan.id,
      newPlannedAt: updatedPlan.planned_at,
    })

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
    })
  } catch (error: any) {
    console.error('[API] Error updating platform plan:', {
      error: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update platform plan' },
      { status: 500 }
    )
  }
}
