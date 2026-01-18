import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { validateSetData } from '@/lib/admin-validation'
import { withAdminAuthAndCSRF } from '@/lib/api-security'

async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate and sanitize input
    const validation = validateSetData(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    // Insert validated data
    const { data, error } = await supabase
      .from('sets')
      .insert([validation.data])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      // Don't expose database error details
      return NextResponse.json(
        { error: 'Failed to create set' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error creating set:', error)
    return NextResponse.json(
      { error: 'Failed to create set' },
      { status: 500 }
    )
  }
}

export const POST = withAdminAuthAndCSRF(handlePOST)
