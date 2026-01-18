import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAdminAuthAndCSRF } from '@/lib/api-security'
import { validateObject, sanitizeInput, isValidURL } from '@/lib/security'

async function handlePUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input - only allow URL fields
    const validation = validateObject(body, {
      youtube: { type: 'url', required: false },
      spotify: { type: 'url', required: false },
      apple_music: { type: 'url', required: false },
      instagram: { type: 'url', required: false },
      tiktok: { type: 'url', required: false },
      twitter: { type: 'url', required: false },
      facebook: { type: 'url', required: false },
    })

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    // Sanitize URLs
    const sanitizedData: any = {}
    for (const [key, value] of Object.entries(validation.value || {})) {
      if (value && isValidURL(value as string)) {
        sanitizedData[key] = sanitizeInput(value as string)
      }
    }

    // Check if global_links row exists
    const { data: existing } = await supabase
      .from('global_links')
      .select('id')
      .limit(1)
      .single()

    let result
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('global_links')
        .update(sanitizedData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to update links' },
          { status: 500 }
        )
      }
      result = data
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('global_links')
        .insert([sanitizedData])
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to update links' },
          { status: 500 }
        )
      }
      result = data
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('Error updating links:', error)
    return NextResponse.json(
      { error: 'Failed to update links' },
      { status: 500 }
    )
  }
}

export const PUT = withAdminAuthAndCSRF(handlePUT)
