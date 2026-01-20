import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getClientIP, rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

// DELETE: Delete asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`social-asset-delete:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 20,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Get asset to get storage_path
    const { data: asset, error: fetchError } = await supabaseAdmin
      .from('social_assets')
      .select('storage_path')
      .eq('id', params.id)
      .single()

    if (fetchError || !asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('social_assets')
      .delete()
      .eq('id', params.id)

    if (deleteError) throw deleteError

    // Note: Storage file deletion should be handled separately via storage API
    // For now, we only delete the database record

    // Log audit
    await supabaseAdmin
      .from('social_audit_log')
      .insert({
        actor_id: 'admin',
        action: 'delete',
        entity_type: 'asset',
        entity_id: params.id,
        meta: { storage_path: asset.storage_path },
      })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] Error deleting asset:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete asset' },
      { status: 500 }
    )
  }
}
