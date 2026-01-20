import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getClientIP, rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

// POST: Retry a failed job
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-retry-job:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 20,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Get job
    const { data: job, error: fetchError } = await supabaseAdmin
      .from('social_jobs')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if job is in failed status
    if (job.status !== 'failed') {
      return NextResponse.json(
        { error: `Job is not in failed status. Current status: ${job.status}` },
        { status: 400 }
      )
    }

    // Update job to pending and increment attempts
    const { data: updatedJob, error: updateError } = await supabaseAdmin
      .from('social_jobs')
      .update({
        status: 'pending',
        attempts: (job.attempts || 0) + 1,
        last_error: null,
        next_retry_at: null, // Clear retry schedule since we're manually retrying
        result: {
          ...(job.result || {}),
          retry: true,
          retry_at: new Date().toISOString(),
        },
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('[API] Error updating job:', updateError)
      return NextResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      )
    }

    // Log audit
    await supabaseAdmin
      .from('social_audit_log')
      .insert({
        actor_id: 'admin',
        action: 'retry',
        entity_type: 'job',
        entity_id: params.id,
        meta: {
          platform: job.platform,
          step: job.step,
          post_id: job.post_id,
          attempts: updatedJob.attempts,
          previous_status: 'failed',
        },
      })

    return NextResponse.json({
      success: true,
      message: 'Job retry initiated. Since OAuth is not yet implemented, use "Assisted" mode.',
      job: updatedJob,
    })
  } catch (error: any) {
    console.error('[API] Error retrying job:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to retry job' },
      { status: 500 }
    )
  }
}
