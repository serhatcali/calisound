import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getClientIP, rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

// DELETE: Disconnect an account
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
    const rateLimitResult = rateLimit(`social-disconnect:${clientIP}`, {
      windowMs: 60000,
      maxRequests: 10,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Update account status to disconnected and clear tokens
    const { error } = await supabaseAdmin
      .from('social_accounts')
      .update({
        status: 'disconnected',
        token_encrypted: null,
        refresh_encrypted: null,
        expires_at: null,
      })
      .eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] Error disconnecting account:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect account' },
      { status: 500 }
    )
  }
}
