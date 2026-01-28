import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { deleteReleaseAsset, getReleaseAssets } from '@/lib/release-planning-service'

export const dynamic = 'force-dynamic'

// DELETE: Delete asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; assetId: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get asset to find storage path
    const assets = await getReleaseAssets(params.id)
    const asset = assets.find(a => a.id === params.assetId)

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Delete from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from('releases')
      .remove([asset.storage_path])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Continue to delete DB record even if storage delete fails
    }

    // Delete from database
    await deleteReleaseAsset(params.assetId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting asset:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete asset' },
      { status: 500 }
    )
  }
}
