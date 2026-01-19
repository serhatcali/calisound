import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAdminAuthAndCSRF } from '@/lib/api-security'
import { validateString } from '@/lib/security'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

async function handleDELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID
    const idValidation = validateString(params.id, {
      required: true,
      pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    })

    if (!idValidation.valid) {
      return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete contact' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}

export const DELETE = withAdminAuthAndCSRF(handleDELETE)
