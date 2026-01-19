import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateCommentUpdateData } from '@/lib/admin-validation'
import { withAdminAuthAndCSRF } from '@/lib/api-security'
import { validateString } from '@/lib/security'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

async function handlePATCH(
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
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 })
    }

    const body = await request.json()

    // Validate input
    const validation = validateCommentUpdateData(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('comments')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, comment: data })
  } catch (error: any) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
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
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}

export const PATCH = withAdminAuthAndCSRF(handlePATCH)
export const DELETE = withAdminAuthAndCSRF(handleDELETE)
