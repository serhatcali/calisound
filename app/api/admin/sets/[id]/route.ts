import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateSetData } from '@/lib/admin-validation'
import { withAdminAuthAndCSRF } from '@/lib/api-security'
import { validateString } from '@/lib/security'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

async function handlePUT(
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
      return NextResponse.json({ error: 'Invalid set ID' }, { status: 400 })
    }

    const body = await request.json()

    // Validate and sanitize input
    const validation = validateSetData(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('sets')
      .update(validation.data)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update set' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error updating set:', error)
    return NextResponse.json(
      { error: 'Failed to update set' },
      { status: 500 }
    )
  }
}

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
      return NextResponse.json({ error: 'Invalid set ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('sets')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete set' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting set:', error)
    return NextResponse.json(
      { error: 'Failed to delete set' },
      { status: 500 }
    )
  }
}

export const PUT = withAdminAuthAndCSRF(handlePUT)
export const DELETE = withAdminAuthAndCSRF(handleDELETE)
