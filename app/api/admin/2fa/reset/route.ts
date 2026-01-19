import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getClientIP, rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

// POST - Reset 2FA (disable and clear secret)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`2fa-reset:${clientIP}`, {
      windowMs: 300000, // 5 minutes
      maxRequests: 3, // 3 attempts per 5 minutes
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
          },
        }
      )
    }

    // Disable 2FA
    const { error: disableError } = await supabaseAdmin
      .from('admin_settings')
      .upsert({ key: '2fa_enabled', value: 'false' }, { onConflict: 'key' })

    if (disableError) {
      console.error('Error disabling 2FA:', disableError)
      return NextResponse.json(
        { error: 'Failed to disable 2FA' },
        { status: 500 }
      )
    }

    // Delete 2FA secret
    const { error: deleteError } = await supabaseAdmin
      .from('admin_settings')
      .delete()
      .eq('key', '2fa_secret')

    if (deleteError) {
      console.error('Error deleting 2FA secret:', deleteError)
      // Continue anyway - secret might not exist
    }

    return NextResponse.json({ 
      success: true, 
      message: '2FA has been reset. You can now set it up again.' 
    })
  } catch (error: any) {
    console.error('Error resetting 2FA:', error)
    return NextResponse.json(
      { error: 'Failed to reset 2FA' },
      { status: 500 }
    )
  }
}
