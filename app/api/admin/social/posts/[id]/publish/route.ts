import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getSocialPost, updateSocialPost } from '@/lib/social-media-service'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getClientIP, rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

// POST: Publish a post
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
    const rateLimitResult = rateLimit(`social-publish:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 10,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Get post with variants
    const post = await getSocialPost(params.id)

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if post has variants with content
    if (!post.variants || post.variants.length === 0) {
      return NextResponse.json(
        { error: 'Post has no content to publish. Please add content for at least one platform.' },
        { status: 400 }
      )
    }

    // Filter variants that have content
    const variantsWithContent = post.variants.filter(v => 
      v.caption || v.description || v.title
    )

    if (variantsWithContent.length === 0) {
      return NextResponse.json(
        { error: 'No variants with content found' },
        { status: 400 }
      )
    }

    // Update post status to 'publishing'
    await updateSocialPost(params.id, {
      status: 'publishing',
      error_last: null, // Clear any previous errors
    })

    // Create jobs for each platform variant
    // Note: Since OAuth is not yet implemented, jobs will be in 'pending' status
    // In assisted mode, users will manually upload the content
    const jobs = []
    for (const variant of variantsWithContent) {
      const { data: job, error: jobError } = await supabaseAdmin
        .from('social_jobs')
        .insert({
          post_id: params.id,
          platform: variant.platform,
          step: 'publish',
          status: 'pending', // Will remain pending until OAuth is implemented
          attempts: 0,
          result: {
            mode: 'assisted',
            message: 'Waiting for manual upload. Use Copy All or Export Pack to get the content.',
            variant_id: variant.id,
          },
        })
        .select()
        .single()

      if (jobError) {
        console.error(`[API] Error creating job for ${variant.platform}:`, jobError)
      } else {
        jobs.push(job)
      }
    }

    // Log audit
    await supabaseAdmin
      .from('social_audit_log')
      .insert({
        actor_id: 'admin',
        action: 'publish',
        entity_type: 'post',
        entity_id: params.id,
        meta: {
          platforms: variantsWithContent.map(v => v.platform),
          job_count: jobs.length,
          mode: 'assisted',
        },
      })

    return NextResponse.json({
      success: true,
      message: `Publish job created for ${jobs.length} platform(s). Since OAuth is not yet implemented, use "Assisted" mode: Copy the content and manually upload to each platform.`,
      jobs_created: jobs.length,
      platforms: variantsWithContent.map(v => v.platform),
    })
  } catch (error: any) {
    console.error('[API] Error publishing post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to publish post' },
      { status: 500 }
    )
  }
}
