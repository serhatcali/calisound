import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: Check if storage bucket exists
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to list files in the calisound bucket
    const { data, error } = await supabase.storage
      .from('calisound')
      .list('', {
        limit: 1,
      })

    if (error) {
      return NextResponse.json({
        exists: false,
        error: error.message,
        details: 'Bucket "calisound" not found or not accessible. Please check: 1. Bucket name is exactly "calisound" (lowercase), 2. Bucket is set to Public, 3. You have the correct Supabase project selected.',
      })
    }

    return NextResponse.json({
      exists: true,
      message: 'Bucket "calisound" is accessible',
      fileCount: data?.length || 0,
    })
  } catch (error: any) {
    console.error('[API] Error checking storage:', error)
    return NextResponse.json(
      {
        exists: false,
        error: error.message || 'Failed to check storage',
      },
      { status: 500 }
    )
  }
}
