import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createReleaseAsset, getReleaseAssets } from '@/lib/release-planning-service'

export const dynamic = 'force-dynamic'

// POST: Upload asset file
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const kind = formData.get('kind') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!kind || !['16_9', '9_16', '1_1', 'audio'].includes(kind)) {
      return NextResponse.json({ error: 'Invalid asset kind' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop() || 'bin'
    const fileName = `${params.id}/${kind}/${timestamp}.${fileExt}`
    const storagePath = `releases/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('releases')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('releases')
      .getPublicUrl(storagePath)

    // Create asset record
    const asset = await createReleaseAsset({
      release_id: params.id,
      kind: kind as '16_9' | '9_16' | '1_1' | 'audio',
      storage_path: storagePath,
      url: urlData.publicUrl,
    })

    return NextResponse.json(asset)
  } catch (error: any) {
    console.error('Error uploading asset:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload asset' },
      { status: 500 }
    )
  }
}

// GET: List assets for a release
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const assets = await getReleaseAssets(params.id)
    return NextResponse.json(assets)
  } catch (error: any) {
    console.error('Error fetching assets:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}
