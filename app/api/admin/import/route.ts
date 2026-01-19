import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

import { validateString, sanitizeInput } from '@/lib/security'
import { withAdminAuthAndCSRF } from '@/lib/api-security'

async function handlePOST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Validate file type
    const allowedExtensions = ['.csv', '.json']
    const fileName = file.name.toLowerCase()
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))

    if (!isValidExtension) {
      return NextResponse.json(
        { error: 'File must be CSV or JSON' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Validate type
    const typeValidation = validateString(type, {
      required: true,
      pattern: /^(city|set)$/,
    })

    if (!typeValidation.valid) {
      return NextResponse.json(
        { error: 'Type must be "city" or "set"' },
        { status: 400 }
      )
    }

    const text = await file.text()
    let data: any[] = []

    // Parse file with security in mind
    if (file.name.endsWith('.csv')) {
      const lines = text.split('\n').filter(Boolean).slice(0, 1000) // Limit to 1000 rows
      if (lines.length === 0) {
        return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 })
      }
      
      const headers = lines[0].split(',').map(h => sanitizeInput(h.trim()))
      data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => sanitizeInput(v.trim()))
        const obj: any = {}
        headers.forEach((header, i) => {
          obj[header] = values[i] || ''
        })
        return obj
      })
    } else if (file.name.endsWith('.json')) {
      try {
        const parsed = JSON.parse(text)
        if (!Array.isArray(parsed)) {
          return NextResponse.json(
            { error: 'JSON must be an array' },
            { status: 400 }
          )
        }
        data = parsed.slice(0, 1000) // Limit to 1000 items
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Invalid JSON format' },
          { status: 400 }
        )
      }
    }

    let count = 0
    const errors: string[] = []

    for (const item of data) {
      try {
        if (type === 'city') {
          // Map CSV/JSON fields to City structure with validation
          const cityData = {
            name: sanitizeInput(String(item.name || item.title || '')).substring(0, 100),
            slug: sanitizeInput(String(item.slug || item.name?.toLowerCase().replace(/\s+/g, '-') || '')).substring(0, 100),
            country: sanitizeInput(String(item.country || '')).substring(0, 100),
            country_flag: item.country_flag || item.flag || null,
            region: sanitizeInput(String(item.region || '')).substring(0, 100),
            mood: Array.isArray(item.mood) 
              ? item.mood.map((m: any) => sanitizeInput(String(m))).slice(0, 10) // Limit to 10 moods
              : (item.mood?.split(',').map((m: string) => sanitizeInput(m.trim())).slice(0, 10) || []),
            status: ['SOON', 'OUT_NOW', 'COMING_SOON'].includes(item.status) ? item.status : 'SOON',
            release_datetime: item.release_datetime || null,
            cover_square_url: item.cover_square_url || item.cover || null,
            banner_16x9_url: item.banner_16x9_url || item.banner || null,
            youtube_full: item.youtube_full || item.youtube || null,
            description_en: item.description_en || item.description ? sanitizeInput(String(item.description_en || item.description)).substring(0, 5000) : null,
          }

          const { error } = await supabase.from('cities').insert(cityData)
          if (error) throw error
        } else if (type === 'set') {
          const setData = {
            title: sanitizeInput(String(item.title || item.name || '')).substring(0, 200),
            youtube_embed: item.youtube_embed || item.youtube || null,
            duration: item.duration || null,
            description: item.description ? sanitizeInput(String(item.description)).substring(0, 5000) : null,
            chapters: item.chapters || null,
          }

          const { error } = await supabase.from('sets').insert(setData)
          if (error) throw error
        }
        count++
      } catch (error: any) {
        const itemName = item.name || item.title || 'item'
        errors.push(`Error importing ${itemName}`)
      }
    }

    return NextResponse.json({
      success: true,
      count,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Error importing:', error)
    return NextResponse.json(
      { error: 'Failed to import file' },
      { status: 500 }
    )
  }
}

export const POST = withAdminAuthAndCSRF(handlePOST)
