import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

import { validateNumber } from '@/lib/security'

    const searchParams = request.nextUrl.searchParams
    const limitParam = searchParams.get('limit')

    // Validate limit
    const limitValidation = validateNumber(limitParam ? parseInt(limitParam) : 50, {
      min: 1,
      max: 200, // Max 200 logs
      integer: true,
    })

    if (!limitValidation.valid) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 200' },
        { status: 400 }
      )
    }

    const limit = limitValidation.value || 50

    const { data, error } = await supabase
      .from('activity_logs')
      .select('id, user_id, action, entity_type, entity_id, entity_name, created_at') // Don't select all fields
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch activity logs' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, logs: data || [] })
  } catch (error: any) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
}

import { validateObject, sanitizeInput } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validation = validateObject(body, {
      user_id: { type: 'string', required: false, maxLength: 100 },
      action: { type: 'string', required: true, maxLength: 50 },
      entity_type: { type: 'string', required: false, maxLength: 50 },
      entity_id: { type: 'string', required: false, maxLength: 100 },
      entity_name: { type: 'string', required: false, maxLength: 200 },
      changes: { type: 'string', required: false }, // JSON string
      ip_address: { type: 'string', required: false, maxLength: 50 },
      user_agent: { type: 'string', required: false, maxLength: 500 },
    })

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const {
      user_id,
      action,
      entity_type,
      entity_id,
      entity_name,
      changes,
      ip_address,
      user_agent,
    } = validation.value!

    // Sanitize inputs
    const sanitizedData = {
      user_id: user_id ? sanitizeInput(user_id) : 'admin',
      action: sanitizeInput(action),
      entity_type: entity_type ? sanitizeInput(entity_type) : null,
      entity_id: entity_id ? sanitizeInput(entity_id) : null,
      entity_name: entity_name ? sanitizeInput(entity_name) : null,
      changes: changes || null,
      ip_address: ip_address ? sanitizeInput(ip_address) : null,
      user_agent: user_agent ? sanitizeInput(user_agent).substring(0, 500) : null,
    }

    const { data, error } = await supabase
      .from('activity_logs')
      .insert([sanitizedData])
      .select('id, user_id, action, entity_type, entity_id, entity_name, created_at') // Don't select all fields
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create activity log' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, log: data })
  } catch (error: any) {
    console.error('Error creating activity log:', error)
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    )
  }
}
